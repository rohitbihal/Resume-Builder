import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

// Helper to get chromium pack based on version
// Using a reliable pack URL for Chromium 123
const CHROMIUM_PACK_URL = 'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';

export async function POST(req) {
  let browser = null;
  try {
    const { html, css } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

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
            @page { margin: 0; size: A4; }
            body { 
              margin: 0; padding: 0;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              font-family: 'Inter', sans-serif;
            }
            .resumePage { box-shadow: none !important; margin: 0 !important; border: none !important; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `;

    const isLocal = process.env.NODE_ENV === 'development';
    
    // Launch options for different environments
    const launchOptions = {
      args: isLocal ? puppeteer.defaultArgs() : [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal 
        ? (process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
            : '/usr/bin/google-chrome')
        : await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: isLocal ? true : chromium.headless,
    };

    // Vercel-specific fix: Ensure LD_LIBRARY_PATH is set if we have an executable path
    if (!isLocal && launchOptions.executablePath) {
      const execDir = launchOptions.executablePath.substring(0, launchOptions.executablePath.lastIndexOf('/'));
      process.env.LD_LIBRARY_PATH = `${execDir}:${process.env.LD_LIBRARY_PATH || ''}`;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

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

  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (browser) await browser.close();
    
    return NextResponse.json({ 
      error: 'PDF generation failed', 
      details: error.message,
      suggestion: 'This error is often due to serverless environment constraints. Trying again usually helps, or increase function memory in Vercel settings.'
    }, { status: 500 });
  }
}
