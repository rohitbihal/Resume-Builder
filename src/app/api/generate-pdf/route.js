import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getUserPlanContext, canDownloadPdf, hasNoWatermark, logAccessAttempt } from '@/lib/planAccess';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { errorResponse } from '@/lib/validate';

const log = logger('api/generate-pdf');

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId });

  // ─── 0. Rate Limiting (IP + User) ─────────────────────────────────────
  let userId = null;
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const payloadBase64 = authHeader.split('.')[1];
      if (payloadBase64) userId = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8')).sub || null;
    } catch {}
  }
  
  const { success: rateLimitOk, headers: rateLimitHeaders } = rateLimiter(req, 'general', userId);
  if (!rateLimitOk) {
    log.warn('Rate limit exceeded for PDF generation', { requestId });
    return NextResponse.json(
      errorResponse('Too many requests. Please wait before generating another PDF.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  let browser = null;
  try {
    const { html, css, multiPage = false } = await req.json();

    if (!html) {
      log.warn('Missing HTML content', { requestId });
      return NextResponse.json(errorResponse('HTML content is required', requestId), { status: 400, headers: rateLimitHeaders });
    }

    // --- RBAC & Plan Verification ---
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll(cookiesToSet) { }
        },
      }
    );

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    let profile = null;
    if (user) {
      const { data } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
      profile = data;
    }

    const planContext = getUserPlanContext(profile);
    
    if (!canDownloadPdf(planContext)) {
      if (user) await logAccessAttempt(adminSupabase, user.id, 'download_pdf', 'blocked', 'Single download exhausted');
      log.warn('PDF download blocked due to plan limits', { requestId, userId: user?.id, tier: planContext.tier });
      return NextResponse.json(
        errorResponse('Access Denied. You have used your single download. Upgrade to Monthly for unlimited downloads.', requestId), 
        { status: 403, headers: rateLimitHeaders }
      );
    }

    const injectWatermark = !hasNoWatermark(planContext);
    const watermarkHtml = '<div style="position: absolute; bottom: 10px; right: 20px; color: #a0aec0; font-size: 10px; font-family: sans-serif; z-index: 9999;">Created with CreativeResume (Free)</div>';
    
    // Clean out frontend watermark if it passed one, so we don't double up, and enforce our own if required.
    let contentHtml = html.replace(/<div[^>]*>Created with CreativeResume \(Free\)<\/div>/gi, '');
    if (injectWatermark) {
      contentHtml += watermarkHtml;
    }

    // Process Single Download increment
    if (user && planContext.tier === 'single_download') {
      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({ downloads_used: planContext.downloadsUsed + 1 })
        .eq('id', user.id);
      
      if (updateError) {
        log.error('Failed to increment download counter', { requestId, error: updateError.message });
        return NextResponse.json(errorResponse('Failed to process plan tracking', requestId), { status: 500, headers: rateLimitHeaders });
      }
    }

    if (user) await logAccessAttempt(adminSupabase, user.id, 'download_pdf', 'granted', `Downloaded under plan: ${planContext.tier}`);

    // Multi-page CSS: let content flow naturally across A4 pages.
    // IMPORTANT: Do NOT use page-break-after:always on .resumePage —
    // that forces Puppeteer to repeat the wrapper div as a new "page".
    const multiPageStyles = multiPage ? `
      /* Strip the fixed A4 height so content flows to page 2, 3, etc. */
      .resumePage, [class*="resumePage"] {
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        page-break-after: avoid !important;
        box-shadow: none !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      body, html {
        height: auto !important;
        overflow: visible !important;
      }
      /* Prevent section headings and entries from being split across pages */
      h2, h3, [class*="SectionTitle"], [class*="sectionTitle"], [class*="Entry"], [class*="entry"] {
        page-break-inside: avoid;
        break-inside: avoid;
      }
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
            
            * {
              box-sizing: border-box;
            }
            ${css || ''}
            @page { 
              margin: 20mm; 
              size: A4; 
            }
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
        <body>${contentHtml}</body>
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
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      });

      log.info('PDF generated successfully', { requestId, durationMs: Date.now() - startTime });
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="resume.pdf"',
          ...rateLimitHeaders // include limit headers on success
        },
      });
    } finally {
      if (browser) {
        await browser.close();
        browser = null;
      }
    }

  } catch (error) {
    log.error('PDF Generation Error', { requestId, error: error.message });
    return NextResponse.json(
      errorResponse('PDF generation failed.', requestId, { details: error.message }), 
      { status: 500, headers: typeof rateLimitHeaders !== 'undefined' ? rateLimitHeaders : {} }
    );
  }
}

