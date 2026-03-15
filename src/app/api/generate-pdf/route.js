import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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

    // Configuration for local vs production (Vercel)
    const isLocal = process.env.NODE_ENV === 'development';
    
    // Launch puppeteer with platform-specific options
    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal 
        ? (process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
            : '/usr/bin/google-chrome')
        : await chromium.executablePath(),
      headless: isLocal ? true : chromium.headless,
    });

    try {
      const page = await browser.newPage();
      
      // Set timeout for all operations
      page.setDefaultNavigationTimeout(30000); 
      page.setDefaultTimeout(30000);

      // Set viewport matching A4 size
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

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="resume.pdf"',
        },
      });
    } catch (innerError) {
      console.error('Inner PDF Error:', innerError);
      if (browser) await browser.close();
      throw innerError;
    }
  } catch (error) {
    console.error('Critical PDF Generation Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF', 
      details: error.message,
      suggestion: 'If on Vercel, ensure @sparticuz/chromium is installed.'
    }, { status: 500 });
  }
}
