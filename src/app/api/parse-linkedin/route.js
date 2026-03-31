import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { validateLinkedInUrl, validatePdfFile, errorResponse, successResponse } from '@/lib/validate';

// pdf-parse is a CommonJS module and must be required for Turbopack compatibility
const pdf = require('pdf-parse');

export const maxDuration = 90; // Allow extra time for PDF parsing + AI

const log = logger('api/parse-linkedin');

export async function POST(req) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId });

  let browser = null;

  // ─── 1. Rate Limiting (IP + User) ─────────────────────────────────────
  const authHeader = req.headers.get('authorization') || '';
  let userId = null;
  if (authHeader.startsWith('Bearer ')) {
    try {
      const payloadBase64 = authHeader.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        userId = payload.sub || null;
      }
    } catch {
      // Ignore invalid JWTs for rate limiting purposes
    }
  }

  const { success: rateLimitOk, headers: rateLimitHeaders } = rateLimiter(req, 'ai', userId);
  if (!rateLimitOk) {
    log.warn('Rate limit exceeded', { requestId });
    return NextResponse.json(
      errorResponse('Too many import requests. Please wait before trying again.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let rawText = '';

    if (contentType.includes('application/json')) {
      // ─── URL Mode ────────────────────────────────────────────────────
      let body;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          errorResponse('Invalid request body. Expected JSON.', requestId),
          { status: 400, headers: rateLimitHeaders }
        );
      }

      const { url } = body;

      // Validate URL using our validator
      const urlValidation = validateLinkedInUrl(url);
      if (!urlValidation.valid) {
        return NextResponse.json(
          errorResponse(urlValidation.error, requestId),
          { status: 400, headers: rateLimitHeaders }
        );
      }

      log.info('Scraping LinkedIn URL', { requestId, url: urlValidation.url });

      const isLocal = process.env.NODE_ENV === 'development';
      const launchOptions = isLocal
        ? {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
            executablePath: process.platform === 'win32'
              ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
              : '/usr/bin/google-chrome',
            headless: 'new',
          }
        : {
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(
              'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
            ),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
          };

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });

      const response = await page.goto(urlValidation.url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      }).catch(e => {
        log.error('Puppeteer navigation error', { requestId, error: e.message });
        return { status: () => 999 };
      });

      const status = response.status();
      if (status === 999 || status === 429 || status >= 400) {
        return NextResponse.json(
          errorResponse('LinkedIn is blocking direct import. Please export your LinkedIn profile as a PDF and upload it here.', requestId),
          { status: 422, headers: rateLimitHeaders }
        );
      }

      await new Promise(r => setTimeout(r, 2000));

      rawText = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        if (bodyText.includes('authwall') || bodyText.includes('Sign in') || document.title.includes('Sign In')) {
          return 'AUTH_WALL_DETECTED';
        }
        const scripts = document.querySelectorAll('script, style, nav, footer, iframe');
        scripts.forEach(s => s.remove());
        return document.body.innerText;
      });

      await browser.close();
      browser = null;

      if (rawText === 'AUTH_WALL_DETECTED') {
        return NextResponse.json(
          errorResponse('LinkedIn requires login to view this profile. Please export your profile as a PDF and upload it here.', requestId),
          { status: 403, headers: rateLimitHeaders }
        );
      }

    } else {
      // ─── PDF Upload Mode ──────────────────────────────────────────────
      let formData;
      try {
        formData = await req.formData();
      } catch {
        return NextResponse.json(
          errorResponse('Invalid form data.', requestId),
          { status: 400, headers: rateLimitHeaders }
        );
      }

      const file = formData.get('file');

      // Validate file
      const fileValidation = validatePdfFile(file);
      if (!fileValidation.valid) {
        return NextResponse.json(
          errorResponse(fileValidation.error, requestId),
          { status: 400, headers: rateLimitHeaders }
        );
      }

      log.info('Parsing PDF upload', { requestId, fileSize: file.size, fileName: file.name });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        const pdfData = await pdf(buffer);
        rawText = pdfData.text;
      } catch (pdfError) {
        log.error('PDF parse error', { requestId, error: pdfError.message });
        return NextResponse.json(
          errorResponse('Could not read the PDF. Please make sure you uploaded your LinkedIn profile PDF and not a custom resume.', requestId),
          { status: 422, headers: rateLimitHeaders }
        );
      }
    }

    // ─── Validate Extracted Text ─────────────────────────────────────────
    if (!rawText || rawText.trim().replace(/\s/g, '').length < 100) {
      return NextResponse.json(
        errorResponse('Could not extract enough meaningful text from the profile. If you used a PDF, please make sure you uploaded your LinkedIn profile PDF and not a custom resume.', requestId),
        { status: 422, headers: rateLimitHeaders }
      );
    }

    // ─── AI Parsing with Timeout ─────────────────────────────────────────
    if (!process.env.GEMINI_API_KEY) {
      log.error('GEMINI_API_KEY is not set', { requestId });
      return NextResponse.json(
        errorResponse('Server configuration error.', requestId),
        { status: 500, headers: rateLimitHeaders }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert resume parser. I will provide you with raw text extracted from a LinkedIn profile or PDF resume.
      Your goal is to extract the information and return it in a strictly valid JSON format that matches the following schema.

      Required Schema:
      {
        "personalInfo": {
          "fullName": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "portfolio": "",
          "jobTitle": ""
        },
        "executiveSummary": "",
        "workExperience": [
          {
            "id": "unique-id-work-1",
            "company": "",
            "title": "",
            "location": "",
            "startDate": "",
            "endDate": "",
            "description": ""
          }
        ],
        "education": [
          {
            "id": "unique-id-edu-1",
            "institution": "",
            "degree": "",
            "field": "",
            "location": "",
            "startDate": "",
            "endDate": "",
            "gpa": "",
            "cgpa": ""
          }
        ],
        "skills": [
          {
            "id": "unique-id-skill-1",
            "name": "",
            "level": "intermediate"
          }
        ],
        "certifications": [
           {"id": "unique-id-cert-1", "name": "", "issuer": "", "date": ""}
        ],
        "academicProjects": [
          {
             "id": "unique-id-proj-1",
             "name": "",
             "technologies": "",
             "link": "",
             "description": ""
          }
        ],
        "customSections": [
          {
             "id": "volunteer-section-1",
             "title": "Volunteer / Extra-Curricular",
             "items": [
               { "id": "volunteer-item-1", "content": "Role at Organization: Description" }
             ]
          }
        ]
      }

      Rules:
      1. Return ONLY the JSON object. No preamble, no explanation, no markdown backticks.
      2. Generate unique IDs (short strings) for each item in arrays.
      3. If a field is not found, leave it as an empty string or empty array.
      4. Ensure dates are in a readable format (e.g., "Jan 2020").
      5. Correct capitalization and clean up the text.

      Raw Text:
      ${rawText.substring(0, 15_000)}
    `;

    const controller = new AbortController();
    const aiTimeout = setTimeout(() => controller.abort(), 60_000);

    let parsedData;
    try {
      const result = await model.generateContent(prompt);
      clearTimeout(aiTimeout);
      const responseArr = await result.response;
      const content = responseArr.text();
      const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(jsonString);
    } catch (aiError) {
      clearTimeout(aiTimeout);
      if (aiError.name === 'AbortError') {
        log.error('Gemini timed out', { requestId });
        return NextResponse.json(
          errorResponse('Parsing timed out. Please try again.', requestId),
          { status: 504, headers: rateLimitHeaders }
        );
      }
      log.error('Gemini JSON parse error', { requestId, error: aiError.message });
      return NextResponse.json(
        errorResponse('Failed to parse AI response into profile data.', requestId),
        { status: 500, headers: rateLimitHeaders }
      );
    }

    log.info('Profile parsed successfully', { requestId, durationMs: Date.now() - startTime });
    return NextResponse.json(
      successResponse(parsedData, requestId),
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    log.error('Profile parse error', { requestId, error: error.message });
    return NextResponse.json(
      errorResponse('Internal server error while parsing profile.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  } finally {
    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
    }
  }
}
