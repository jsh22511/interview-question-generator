/**
 * 🚀 Interview Question Generator API
 * 
 * HOW TO RUN LOCALLY:
 * 1. Add your OpenAI API key: echo "OPENAI_API_KEY=sk-yourkey" > .env.local
 * 2. Run: npm run dev
 * 3. Open: http://localhost:3000
 * 4. Submit form - console should show 200 OK
 * 
 * HOW TO DEPLOY TO VERCEL:
 * 1. Push to GitHub
 * 2. Connect to Vercel
 * 3. Add OPENAI_API_KEY in Vercel dashboard
 * 4. Deploy automatically
 * 
 * HOW TO TEST:
 * curl -X POST http://localhost:3000/api/generate-questions \
 *   -H "Content-Type: application/json" \
 *   -d '{"role":"Software Engineer","seniority":"mid","jdText":"Job description","cvText":"CV content"}'
 * 
 * HOW TO UPDATE FOR EMBEDDING/CODEPEN:
 * Update the API_URL in your frontend to: https://yourproject.vercel.app/api/generate-questions
 */

import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

// CORS allowlist - add your domains here
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://interview-question-generator.vercel.app',
  'https://virtualwizards.com',
  'https://www.virtualwizards.com',
  'https://codepen.io', // For CodePen testing
];

export default async function handler(req) {
  const origin = req.headers.get('origin');
  
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { role, seniority, jdText, cvText } = await req.json();

    // Validate input
    if (!role || !seniority || !jdText || !cvText) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create the prompt for OpenAI
    const prompt = `You are an expert HR professional and technical interviewer. Generate tailored interview questions for a ${seniority} level ${role} position.

Job Description:
${jdText}

Candidate CV:
${cvText}

Generate 8-12 interview questions organized into 3-4 categories. Each question should include:
1. The question itself
2. Why it matters (what it assesses)
3. What a good answer sounds like

Format the response as JSON with this structure:
{
  "categories": [
    {
      "name": "Category Name",
      "questions": [
        {
          "q": "Question text",
          "why_it_matters": "Why this question matters",
          "what_good_sounds_like": "What a good answer sounds like"
        }
      ]
    }
  ],
  "bonus": {
    "red_flags": ["List of potential red flags to watch for"],
    "homework_prompt": "Optional homework assignment for the candidate"
  }
}

Make the questions specific to the role, seniority level, and candidate background. Focus on technical skills, problem-solving, and cultural fit.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR professional and technical interviewer. Generate high-quality, tailored interview questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse the JSON response
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback to a structured response
      questions = {
        categories: [
          {
            name: "Technical Skills",
            questions: [
              {
                q: "Can you walk me through your experience with the technologies mentioned in the job description?",
                why_it_matters: "This helps assess the candidate's hands-on experience with relevant technologies.",
                what_good_sounds_like: "A good answer would include specific examples, challenges faced, and solutions implemented."
              }
            ]
          }
        ],
        bonus: {
          red_flags: ["No specific examples provided"],
          homework_prompt: "Please prepare a technical demonstration of your skills."
        }
      };
    }

    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate questions',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
