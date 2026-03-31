import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { validateOrderInput, errorResponse, successResponse } from '@/lib/validate';

export const maxDuration = 60;

const log = logger('api/razorpay/order');

// In-memory idempotency store (per serverless instance, sufficient for double-click prevention)
const idempotencyStore = new Map();
const IDEMPOTENCY_TTL = 30_000; // 30 seconds

function checkIdempotency(key) {
  const now = Date.now();
  // Cleanup expired keys
  for (const [k, ts] of idempotencyStore.entries()) {
    if (now - ts > IDEMPOTENCY_TTL) idempotencyStore.delete(k);
  }
  if (idempotencyStore.has(key)) return false; // Duplicate!
  idempotencyStore.set(key, now);
  return true;
}

export async function POST(req) {
  const requestId = getRequestId(req);
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

  const { success: rateLimitOk, headers: rateLimitHeaders } = rateLimiter(req, 'payment', userId);
  if (!rateLimitOk) {
    log.warn('Payment rate limit exceeded', { requestId });
    return NextResponse.json(
      errorResponse('Too many payment requests. Please wait.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  // ─── 2. Idempotency Key (prevents double-click charging) ──────────────
  const idempotencyKey = req.headers.get('x-idempotency-key');
  if (idempotencyKey) {
    const isNew = checkIdempotency(idempotencyKey);
    if (!isNew) {
      log.warn('Duplicate order request blocked', { requestId, idempotencyKey });
      return NextResponse.json(
        errorResponse('Duplicate request detected. Your previous order is being processed.', requestId),
        { status: 409, headers: rateLimitHeaders }
      );
    }
  }

  // ─── 3. Validate Input ────────────────────────────────────────────────
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse('Invalid request body.', requestId),
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const { valid, errors } = validateOrderInput(body);
  if (!valid) {
    log.warn('Order validation failed', { requestId, errors });
    return NextResponse.json(
      errorResponse(`Validation failed: ${errors.join('; ')}`, requestId),
      { status: 400, headers: rateLimitHeaders }
    );
  }

  // ─── 4. Environment Check ──────────────────────────────────────────────
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    log.error('Razorpay keys missing', { requestId });
    return NextResponse.json(
      errorResponse('Payment service is not configured.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  }

  // ─── 5. Create Order ──────────────────────────────────────────────────
  try {
    const { amount, planId, userId: bodyUserId } = body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Amount in paise, rounded to avoid float issues
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: planId || 'single_download',
        userId: bodyUserId || 'anonymous',
        requestId,
      },
    };

    log.info('Creating Razorpay order', { requestId, planId: options.notes.planId, amount });
    const order = await instance.orders.create(options);

    log.info('Razorpay order created', { requestId, orderId: order.id });
    return NextResponse.json(
      successResponse(order, requestId),
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    log.error('Razorpay order creation failed', { requestId, error: error.message });
    return NextResponse.json(
      errorResponse('Failed to create payment order. Please try again.', requestId),
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
