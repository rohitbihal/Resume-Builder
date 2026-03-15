import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req) {
  try {
    const { html, css } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Combine HTML and CSS into a complete document
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            ${css || ''}
            
            /* Ensures exact background and size printing */
            @page { 
              margin: 0;
              size: A4;
            }
            
            body { 
              margin: 0; 
              padding: 0;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              font-family: 'Inter', sans-serif;
            }

            .resumePage {
              box-shadow: none !important;
              margin: 0 !important;
              border: none !important;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // Launch puppeteer with timeout and better error handling
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
    });

    try {
      const page = await browser.newPage();
      
      // Set timeout for all operations
      page.setDefaultNavigationTimeout(30000); // Increased to 30s for font loading
      page.setDefaultTimeout(30000);

      // Set viewport matching A4 size at high DPI for clarity
      await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
      
      // Set the HTML content and wait for fonts
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      await page.evaluateHandle('document.fonts.ready');

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      await browser.close();

      // Return the PDF buffer directly
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="resume.pdf"',
        },
      });
    } catch (innerError) {
      console.error('Inner PDF Error:', innerError);
      await browser.close();
      throw innerError;
    }
  } catch (error) {
    console.error('Critical PDF Generation Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF', 
      details: error.message,
      suggestion: 'Try using the browser print function if this continues.'
    }, { status: 500 });
  }
}
