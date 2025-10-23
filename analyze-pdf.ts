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
    const { pdfData, fileName } = await request.json();
    
    if (!pdfData) {
      return NextResponse.json(
        { error: 'PDF data is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Use OpenAI to analyze the PDF
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use the latest model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this PDF document and extract all the text content. This appears to be a resume or CV. Extract all personal information, work experience, education, skills, achievements, and any other relevant details. Return only the extracted text content, formatted clearly.`
            },
            {
              type: 'image_url',
              image_url: {
                url: pdfData
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    });

    const extractedText = response.choices[0]?.message?.content || '';

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. Please try a different file or upload a .txt file instead.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { extractedText: extractedText.trim() },
      {
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

  } catch (error) {
    console.error('PDF analysis error:', error);
    
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
      { error: 'Failed to analyze PDF. Please try a different file or upload a .txt file instead.' },
      { status: 500 }
    );
  }
}
