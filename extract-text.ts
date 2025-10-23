import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Parse request body
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Use OpenAI Vision to extract text from image
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-4o' for better accuracy
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this image. Return only the text content, no formatting or explanations. If this appears to be a resume or CV, extract all personal information, work experience, education, skills, and achievements.'
            },
            {
              type: 'image_url',
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    const extractedText = response.choices[0]?.message?.content || '';

    return NextResponse.json(
      { text: extractedText },
      {
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

  } catch (error) {
    console.error('Text extraction error:', error);
    
    return NextResponse.json(
      { error: 'Failed to extract text from image' },
      { status: 500 }
    );
  }
}
