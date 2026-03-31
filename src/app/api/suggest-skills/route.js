import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { validateSuggestSkillsInput, sanitizeText, errorResponse, successResponse } from '@/lib/validate';

export const maxDuration = 60;

const log = logger('api/suggest-skills');

export async function POST(req) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId });

  // ─── 1. Rate Limiting ─────────────────────────────────────────────────
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
      errorResponse('Too many requests. Please wait before requesting skill suggestions.', requestId),
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

  const { valid, errors } = validateSuggestSkillsInput(body);
  if (!valid) {
    log.warn('Validation failed', { requestId, errors });
    return NextResponse.json(
      errorResponse(`Validation failed: ${errors.join('; ')}`, requestId),
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const { jobTitle, summary, experience } = body;
  const cleanJobTitle = sanitizeText(jobTitle || '', 200);
  const cleanSummary = sanitizeText(summary || '', 3_000);

  // Sanitize experience array items
  const cleanExperience = Array.isArray(experience)
    ? experience.slice(0, 10).map(exp => ({
        title: sanitizeText(exp?.title || '', 200),
        company: sanitizeText(exp?.company || '', 200),
        description: sanitizeText(exp?.description || '', 1_000),
      }))
    : [];

  const expText = cleanExperience
    .map(exp => `${exp.title} at ${exp.company}: ${exp.description}`)
    .join(' | ');

  // ─── 4. AI with Timeout ────────────────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert technical recruiter and career coach.
      Analyze the following resume details to suggest exactly 8 highly relevant professional skills.
      Return the skills as a strictly valid JSON array of strings. No markdown formatting, just the array.
      Exclude soft skills like "Communication" or "Hard worker". Focus on hard skills, tools, methodologies, and technical competencies.
      
      Job Title: ${cleanJobTitle || 'Unknown'}
      Summary: ${cleanSummary || 'None'}
      Experience: ${expText || 'None'}

      Example format: ["React.js", "Node.js", "Project Management", "Agile", "SQL"]
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    let skillsArray;
    try {
      const result = await model.generateContent(prompt);
      clearTimeout(timeout);
      const response = await result.response;
      let content = response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
      skillsArray = JSON.parse(content);

      if (!Array.isArray(skillsArray)) {
        throw new Error('AI returned non-array response');
      }
      // cap at 10 skills, sanitize each
      skillsArray = skillsArray.slice(0, 10).map(s => sanitizeText(String(s), 100));
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

    log.info('Skills suggested', { requestId, count: skillsArray.length, durationMs: Date.now() - startTime });
    return NextResponse.json(
      successResponse({ skills: skillsArray }, requestId),
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    log.error('Suggest skills failed', { requestId, error: error.message });
    return NextResponse.json(
      errorResponse('Failed to suggest skills. Please try again.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
