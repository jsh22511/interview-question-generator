import pdf from 'pdf-parse';
import { fromPath } from 'pdf2pic';
import OpenAI from 'openai';

export class PDFParser {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Parse PDF using multiple methods for maximum reliability
   */
  async parsePDF(pdfBuffer: Buffer, fileName: string): Promise<string> {
    try {
      console.log(`Starting PDF parsing for: ${fileName}`);
      
      // Method 1: Try direct text extraction first (fastest)
      const directText = await this.extractTextDirect(pdfBuffer);
      if (directText && directText.length > 50) {
        console.log('Direct text extraction successful');
        return this.cleanText(directText);
      }

      // Method 2: Convert PDF to images and use OpenAI Vision
      console.log('Direct extraction failed, trying image-based extraction...');
      const imageText = await this.extractTextFromImages(pdfBuffer, fileName);
      if (imageText && imageText.length > 50) {
        console.log('Image-based extraction successful');
        return this.cleanText(imageText);
      }

      // Method 3: Fallback - return helpful message
      throw new Error('Could not extract text from PDF. This might be a scanned document. Please copy the content into a .txt file and upload that instead.');

    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF. Please try uploading a .txt file with your CV content instead.');
    }
  }

  /**
   * Method 1: Direct text extraction using pdf-parse
   */
  private async extractTextDirect(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(pdfBuffer, {
        // Options for better text extraction
        max: 0, // Parse all pages
        version: 'v1.10.100', // Use specific PDF.js version
      });

      return data.text;
    } catch (error) {
      console.error('Direct text extraction failed:', error);
      return '';
    }
  }

  /**
   * Method 2: Convert PDF to images and use OpenAI Vision
   */
  private async extractTextFromImages(pdfBuffer: Buffer, fileName: string): Promise<string> {
    try {
      // Save PDF temporarily
      const tempPath = `/tmp/${Date.now()}_${fileName}`;
      require('fs').writeFileSync(tempPath, pdfBuffer);

      // Convert PDF to images
      const convert = fromPath(tempPath, {
        density: 300, // High quality
        saveFilename: 'page',
        savePath: '/tmp',
        format: 'png',
        width: 2000,
        height: 2000
      });

      const pages = await convert.bulk(-1); // Convert all pages
      console.log(`Converted ${pages.length} pages to images`);

      let allText = '';

      // Process each page with OpenAI Vision
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageText = await this.extractTextFromImage(page.path);
        allText += pageText + '\n';
      }

      // Clean up temporary files
      this.cleanupTempFiles(tempPath, pages);

      return allText;

    } catch (error) {
      console.error('Image-based extraction failed:', error);
      return '';
    }
  }

  /**
   * Extract text from a single image using OpenAI Vision
   */
  private async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      // Read image file
      const imageBuffer = require('fs').readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const imageDataUrl = `data:image/png;base64,${base64Image}`;

      // Use OpenAI Vision to extract text
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this image. This appears to be a page from a resume or CV. Extract all personal information, work experience, education, skills, achievements, and any other relevant details. Return only the extracted text content, formatted clearly.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      return response.choices[0]?.message?.content || '';

    } catch (error) {
      console.error('OpenAI Vision extraction failed:', error);
      return '';
    }
  }

  /**
   * Clean and format extracted text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  /**
   * Clean up temporary files
   */
  private cleanupTempFiles(pdfPath: string, pages: any[]): void {
    try {
      // Remove PDF file
      require('fs').unlinkSync(pdfPath);
      
      // Remove image files
      pages.forEach(page => {
        try {
          require('fs').unlinkSync(page.path);
        } catch (error) {
          console.error('Failed to delete image file:', error);
        }
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Validate PDF file
   */
  validatePDF(buffer: Buffer): boolean {
    // Check if it's a valid PDF by looking for PDF header
    const header = buffer.toString('ascii', 0, 4);
    return header === '%PDF';
  }

  /**
   * Get PDF info
   */
  async getPDFInfo(buffer: Buffer): Promise<any> {
    try {
      const data = await pdf(buffer, { max: 1 }); // Only parse first page for info
      return {
        pages: data.numpages,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Failed to get PDF info:', error);
      return null;
    }
  }
}
