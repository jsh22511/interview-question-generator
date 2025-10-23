import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Rate limiting: Simple in-memory token bucket
// In production, consider using Vercel KV or similar
const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT_TOKENS = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// CORS allowed origins - UPDATE THESE FOR YOUR DOMAINS
const ALLOWED_ORIGINS = [
  'https://interview-question-generator.vercel.app', // Your Vercel domain
  'https://virtualwizards.com', // Your main domain
  'https://www.virtualwizards.com', // Your main domain with www
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  // Add CodePen domain for testing: 'https://codepen.io'
];

// Payload size limits
const MAX_JD_SIZE = 150 * 1024; // 150KB
const MAX_CV_SIZE = 150 * 1024; // 150KB

interface RequestBody {
  role: string;
  seniority: 'entry' | 'mid' | 'senior';
  jdText: string;
  cvText: string;
}

interface Question {
  q: string;
  why_it_matters: string;
  what_good_sounds_like: string;
}

interface Category {
  name: 'Screening' | 'Behavioral' | 'Technical' | 'Scenario' | 'Follow-ups';
  questions: Question[];
}

interface ResponseData {
  role: string;
  seniority: 'entry' | 'mid' | 'senior';
  categories: Category[];
  bonus: {
    red_flags: string[];
    homework_prompt: string;
  };
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit) {
    rateLimitMap.set(ip, { tokens: RATE_LIMIT_TOKENS - 1, lastRefill: now });
    return true;
  }
  
  // Refill tokens if window has passed
  if (now - userLimit.lastRefill >= RATE_LIMIT_WINDOW) {
    userLimit.tokens = RATE_LIMIT_TOKENS - 1;
    userLimit.lastRefill = now;
    return true;
  }
  
  // Check if user has tokens left
  if (userLimit.tokens > 0) {
    userLimit.tokens--;
    return true;
  }
  
  return false;
}

function validatePayload(body: any): { valid: boolean; error?: string } {
  if (!body.role || typeof body.role !== 'string' || body.role.trim().length === 0) {
    return { valid: false, error: 'Role is required and must be a non-empty string' };
  }
  
  if (!body.seniority || !['entry', 'mid', 'senior'].includes(body.seniority)) {
    return { valid: false, error: 'Seniority must be one of: entry, mid, senior' };
  }
  
  if (!body.jdText || typeof body.jdText !== 'string') {
    return { valid: false, error: 'Job description text is required' };
  }
  
  if (!body.cvText || typeof body.cvText !== 'string') {
    return { valid: false, error: 'CV text is required' };
  }
  
  // Check size limits
  if (body.jdText.length > MAX_JD_SIZE) {
    return { valid: false, error: `Job description text exceeds ${MAX_JD_SIZE / 1024}KB limit` };
  }
  
  if (body.cvText.length > MAX_CV_SIZE) {
    return { valid: false, error: `CV text exceeds ${MAX_CV_SIZE / 1024}KB limit` };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // CORS handling
    const origin = request.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { error: 'CORS: Origin not allowed' },
        { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body: RequestBody = await request.json();
    const validation = validatePayload(body);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build the prompt
    const systemPrompt = `You are an expert hiring coordinator. Generate concise, high-signal interview questions tailored to a specific job description and candidate CV. 
Return STRICT JSON only (no markdown, no commentary). 
Avoid any illegal, discriminatory, or overly personal questions. Keep each question ≤ 200 characters.`;

    const userPrompt = `ROLE: ${body.role}
SENIORITY: ${body.seniority}

CONTEXT:
- Job Description (verbatim): """${body.jdText}"""
- Candidate CV (verbatim): """${body.cvText}"""

OUTPUT REQUIREMENTS:
Return JSON with these keys:
{
  "role": string,
  "seniority": "entry" | "mid" | "senior",
  "categories": [
    {
      "name": "Screening" | "Behavioral" | "Technical" | "Scenario" | "Follow-ups",
      "questions": [
        { "q": string, "why_it_matters": string, "what_good_sounds_like": string }
      ]
    }
  ],
  "bonus": {
    "red_flags": string[],
    "homework_prompt": string
  }
}

CONSTRAINTS:
- 5–7 questions per category.
- Questions must reference concrete items from the CV & JD when relevant.
- No sensitive/illegal topics; focus on skills, outcomes, and behaviors.
- JSON only. No markdown.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response
    let responseData: ResponseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response format from AI service' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!responseData.role || !responseData.categories || !Array.isArray(responseData.categories)) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Return user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Service configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
