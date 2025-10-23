import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('PDF parsing endpoint called');
    
    // Parse request body
    const { pdfData, fileName } = await request.json();
    
    if (!pdfData) {
      return NextResponse.json(
        { error: 'PDF data is required' },
        { status: 400 }
      );
    }

    // For now, return a helpful message about PDF parsing
    const extractedText = `PDF Content from ${fileName}

[Note: PDF parsing is currently being configured. For immediate results, please copy your CV content into a .txt file and upload that instead. This ensures 100% reliability while we configure advanced PDF parsing capabilities.]

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
          'Access-Control-Allow-Origin': '*',
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

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
