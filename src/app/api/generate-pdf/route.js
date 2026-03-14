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
          <style>
            ${css || ''}
            /* Ensures exact background and size printing */
            @page { margin: 0; }
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      
      // Set timeout for all operations
      page.setDefaultNavigationTimeout(10000); // 10s
      page.setDefaultTimeout(10000); // 10s

      // Set viewport matching A4 size at 96 DPI roughly
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
      
      // Set the HTML content
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
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
