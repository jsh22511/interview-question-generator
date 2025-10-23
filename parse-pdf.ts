import { NextRequest, NextResponse } from 'next/server';
import { PDFParserEdge } from '../../lib/pdf-parser-edge';
import { ErrorHandler } from '../../lib/error-handler';

// CORS allowed origins
const ALLOWED_ORIGINS = [
  'https://interview-question-generator.vercel.app',
  'https://virtualwizards.com',
  'https://www.virtualwizards.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
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

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfData, 'base64');
    
    // Validate PDF with comprehensive error handling
    const validation = ErrorHandler.validatePDF(pdfBuffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Initialize PDF parser
    const pdfParser = new PDFParserEdge();
    
    // Parse PDF using comprehensive methods
    const extractedText = await pdfParser.parsePDF(pdfBuffer, fileName);

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. This might be a scanned document. Please copy the content into a .txt file and upload that instead.' },
        { status: 400 }
      );
    }

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
    // Use comprehensive error handling
    const errorResponse = ErrorHandler.handleAPIError(error);
    const userMessage = ErrorHandler.handlePDFError(error, 'unknown');
    
    ErrorHandler.logError(error, 'PDF_PARSING_API', { fileName: 'unknown' });
    
    return NextResponse.json(
      { error: userMessage },
      { status: errorResponse.status }
    );
  }
}
