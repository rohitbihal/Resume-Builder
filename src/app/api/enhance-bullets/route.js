import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { validateEnhanceBulletsInput, sanitizeText, errorResponse, successResponse } from '@/lib/validate';

export const maxDuration = 60;

const log = logger('api/enhance-bullets');

export async function POST(req) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId });

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
      errorResponse('Too many requests. Please wait before enhancing more bullet points.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  // ─── 2. Environment Check ──────────────────────────────────────────────
  if (!process.env.GEMINI_API_KEY) {
    log.error('GEMINI_API_KEY is not set', { requestId });
    return NextResponse.json(
      errorResponse('Server configuration error.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  }

  // ─── 3. Parse & Validate ──────────────────────────────────────────────
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse('Invalid request body. Expected JSON.', requestId),
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const { valid, errors } = validateEnhanceBulletsInput(body);
  if (!valid) {
    log.warn('Validation failed', { requestId, errors });
    return NextResponse.json(
      errorResponse(`Validation failed: ${errors.join('; ')}`, requestId),
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const description = sanitizeText(body.description, 5_000);
  const company = sanitizeText(body.company || '', 200);
  const title = sanitizeText(body.title || '', 200);

  // ─── 4. AI Generation with Timeout ────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert executive resume writer and career coach.
      I will provide you with a draft description of a job experience.
      Your goal is to rewrite this into 3 to 4 highly professional, impactful, and ATS-friendly bullet points.
      Use strong action verbs, quantify achievements where possible or imply scale, and focus on results.
      
      Context:
      Company: ${company || 'Unknown'}
      Job Title: ${title || 'Professional'}

      Draft Description:
      ${description}

      Rules:
      1. Return ONLY the rewritten bullet points as plain text.
      2. Start each line with the "• " character (a bullet).
      3. Do NOT include introductory text or markdown code blocks.
      4. Ensure the tone is highly professional and concise.
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000);

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

    log.info('Bullets enhanced', { requestId, durationMs: Date.now() - startTime });
    return NextResponse.json(
      successResponse({ enhancedText: content }, requestId),
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    log.error('Enhance bullets failed', { requestId, error: error.message });
    return NextResponse.json(
      errorResponse('Failed to enhance description. Please try again.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
