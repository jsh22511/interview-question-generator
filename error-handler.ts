export class ErrorHandler {
  /**
   * Handle PDF parsing errors with specific error types
   */
  static handlePDFError(error: any, fileName: string): string {
    console.error('PDF Error Details:', {
      error: error.message,
      fileName,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Specific error handling
    if (error.message.includes('Invalid PDF')) {
      return 'Invalid PDF file. Please ensure you are uploading a valid PDF document.';
    }

    if (error.message.includes('CORS')) {
      return 'CORS error. Please check your domain configuration.';
    }

    if (error.message.includes('API key')) {
      return 'OpenAI API key error. Please check your environment variables.';
    }

    if (error.message.includes('rate limit')) {
      return 'Rate limit exceeded. Please try again in a few minutes.';
    }

    if (error.message.includes('timeout')) {
      return 'Request timeout. Please try with a smaller PDF file.';
    }

    if (error.message.includes('memory')) {
      return 'File too large. Please try with a smaller PDF file.';
    }

    if (error.message.includes('permission')) {
      return 'File access denied. Please try a different file.';
    }

    // Generic fallback
    return 'Failed to parse PDF. Please try uploading a .txt file with your CV content instead.';
  }

  /**
   * Validate PDF file
   */
  static validatePDF(buffer: Buffer): { valid: boolean; error?: string } {
    try {
      // Check file size (max 10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return { valid: false, error: 'File too large. Maximum size is 10MB.' };
      }

      // Check if it's a valid PDF
      const header = buffer.toString('ascii', 0, 4);
      if (header !== '%PDF') {
        return { valid: false, error: 'Invalid PDF file. Please ensure you are uploading a valid PDF.' };
      }

      // Check for minimum content
      if (buffer.length < 100) {
        return { valid: false, error: 'File too small. Please check your PDF file.' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Error validating PDF file.' };
    }
  }

  /**
   * Handle API errors
   */
  static handleAPIError(error: any): { status: number; message: string } {
    console.error('API Error:', error);

    if (error.message.includes('CORS')) {
      return { status: 403, message: 'CORS: Origin not allowed' };
    }

    if (error.message.includes('Invalid PDF')) {
      return { status: 400, message: 'Invalid PDF file' };
    }

    if (error.message.includes('File too large')) {
      return { status: 413, message: 'File too large' };
    }

    if (error.message.includes('API key')) {
      return { status: 500, message: 'Server configuration error' };
    }

    return { status: 500, message: 'Internal server error' };
  }

  /**
   * Log errors for debugging
   */
  static logError(error: any, context: string, additionalData?: any) {
    console.error(`[${context}] Error:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      additionalData
    });
  }
}
