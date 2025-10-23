import { NextRequest, NextResponse } from 'next/server';

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

    // For now, return a helpful message about PDF parsing
    // In a production environment, you would integrate a proper PDF parsing library
    const extractedText = `PDF Content from ${fileName}

[Note: PDF parsing is currently being set up. For immediate results, please copy your CV content into a .txt file and upload that instead. This ensures 100% reliability while we configure advanced PDF parsing capabilities.]

To use this tool right now:
1. Open your PDF CV in a text editor or copy the content
2. Create a new .txt file
3. Paste your CV content into the .txt file
4. Upload the .txt file instead

This will give you immediate, reliable results!`;

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
    console.error('PDF parsing error:', error);
    
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please try uploading a .txt file with your CV content instead.' },
      { status: 500 }
    );
  }
}