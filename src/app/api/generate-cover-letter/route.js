import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { validateCoverLetterInput, sanitizeText, errorResponse, successResponse } from '@/lib/validate';

export const maxDuration = 60;

const log = logger('api/generate-cover-letter');

export async function POST(req) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId });

  // ─── 1. Rate Limiting (IP + User) ─────────────────────────────────────
  // Extract userId from Supabase JWT if present
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
    log.warn('Rate limit exceeded', { requestId, route: 'generate-cover-letter' });
    return NextResponse.json(
      errorResponse('Too many requests. Please wait before generating another cover letter.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  // ─── 2. Environment Check ──────────────────────────────────────────────
  if (!process.env.GEMINI_API_KEY) {
    log.error('GEMINI_API_KEY is not set', { requestId });
    return NextResponse.json(
      errorResponse('Server configuration error. Please contact support.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  }

  // ─── 3. Parse & Validate Input ────────────────────────────────────────
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse('Invalid request body. Expected JSON.', requestId),
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const { valid, errors } = validateCoverLetterInput(body);
  if (!valid) {
    log.warn('Validation failed', { requestId, errors });
    return NextResponse.json(
      errorResponse(`Validation failed: ${errors.join('; ')}`, requestId),
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const { resumeData, jobDescription } = body;
  const cleanJobDescription = sanitizeText(jobDescription, 8_000);

  // Deep sanitize resume data to prevent injection via huge or malicious payload
  const safeResumeData = {};
  if (resumeData && typeof resumeData === 'object') {
    Object.keys(resumeData).forEach(key => {
      if (typeof resumeData[key] === 'string') {
        safeResumeData[key] = sanitizeText(resumeData[key], 2_000);
      } else if (Array.isArray(resumeData[key])) {
        // Cap arrays to 10 items to prevent huge context windows
        safeResumeData[key] = resumeData[key].slice(0, 10).map(item => {
          if (typeof item === 'string') return sanitizeText(item, 1_000);
          if (typeof item === 'object' && item !== null) {
            const safeItem = {};
            Object.keys(item).forEach(k => {
              if (typeof item[k] === 'string') safeItem[k] = sanitizeText(item[k], 1_000);
            });
            return safeItem;
          }
          return item;
        });
      }
    });
  }

  // ─── 4. AI Generation with Timeout ────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert career coach and professional writer.
      Your goal is to write a highly persuasive, professional, and tailored cover letter for a candidate.
      
      Candidate Resume Data:
      ${JSON.stringify(safeResumeData, null, 2)}

      Target Job Description:
      ${cleanJobDescription}

      Rules:
      1. Write a 3-4 paragraph cover letter.
      2. Use a professional tone.
      3. Align the candidate's skills and experience with the requirements in the job description.
      4. Highlight specific achievements from the resume that match the job.
      5. Include placeholders for [Recipient Name], [Company Name], and [Date] if they aren't provided.
      6. Return ONLY the cover letter text. No introductory or concluding remarks from you.
      7. Format with clear line breaks between paragraphs.
    `;

    // Enforce a hard timeout on the AI call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000); // 50s timeout

    let content;
    try {
      const result = await model.generateContent(prompt);
      clearTimeout(timeout);
      const response = await result.response;
      content = response.text().trim().replace(/```.*/g, '').trim();
    } catch (aiError) {
      clearTimeout(timeout);
      if (aiError.name === 'AbortError') {
        log.error('Gemini timed out', { requestId });
        return NextResponse.json(
          errorResponse('AI generation timed out. Please try again.', requestId),
          { status: 504, headers: rateLimitHeaders }
        );
      }
      throw aiError;
    }

    log.info('Cover letter generated', { requestId, durationMs: Date.now() - startTime });
    return NextResponse.json(
      successResponse({ coverLetter: content }, requestId),
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    log.error('Cover letter generation failed', { requestId, error: error.message });
    return NextResponse.json(
      errorResponse('Failed to generate cover letter. Please try again.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
