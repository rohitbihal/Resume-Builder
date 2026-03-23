import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  let browser = null;
  try {
    const { html, css, multiPage = false } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Multi-page CSS additions: allow content to flow across A4 pages naturally
    const multiPageStyles = multiPage ? `
      /* Multi-page support: allow natural page breaks */
      .resumePage { page-break-after: always; break-after: page; }
      .noBreak, h2, h3 { page-break-inside: avoid; break-inside: avoid; }
      body { height: auto !important; overflow: visible !important; }
    ` : `
      /* Single page: clamp to one A4 page */
      body { height: 297mm; overflow: hidden; }
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap');
            
            ${css || ''}
            @page { margin: 0; size: A4; }
            body { 
              margin: 0; padding: 0;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              font-family: 'Inter', sans-serif;
            }
            .resumePage { box-shadow: none !important; margin: 0 !important; border: none !important; }
            ${multiPageStyles}
          </style>
        </head>
        <body>${html}</body>
      </html>
    `;

    const isLocal = process.env.NODE_ENV === 'development';
    
    const launchOptions = isLocal
      ? {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
            : '/usr/bin/google-chrome',
          headless: true,
        }
      : {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(
            'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
          ),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        };
    
    browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      // Use A4 width; height is flexible for multi-page content
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
      
      await page.setContent(fullHtml, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for fonts to load
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="resume.pdf"',
        },
      });
    } finally {
      if (browser) {
        await browser.close();
        browser = null;
      }
    }

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ 
      error: 'PDF generation failed', 
      details: error.message,
      suggestion: 'Ensure your Vercel Function memory is set to at least 1024MB (already updated in vercel.json).'
    }, { status: 500 });
  }
}

