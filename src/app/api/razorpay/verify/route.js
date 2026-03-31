import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId } from '@/lib/logger';
import { validateVerifyInput, errorResponse } from '@/lib/validate';

export const maxDuration = 60;

const log = logger('api/razorpay/verify');

export async function POST(req) {
  const requestId = getRequestId(req);

  // ─── Rate Limiting ───────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') || '';
  let jwtUserId = null;
  if (authHeader.startsWith('Bearer ')) {
    try {
      const payloadBase64 = authHeader.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        jwtUserId = payload.sub || null;
      }
    } catch {
      // Ignore invalid JWTs for rate limiting purposes
    }
  }

  const { success: rateLimitOk, headers: rateLimitHeaders } = rateLimiter(req, 'payment', jwtUserId);
  if (!rateLimitOk) {
    log.warn('Payment verify rate limit exceeded', { requestId });
    return NextResponse.json(
      errorResponse('Too many verification requests. Please wait.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    const bodyText = await req.text();
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        errorResponse('Invalid request body.', requestId),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // ─── Input Validation ──────────────────────────────────────────────
    const { valid: isValid, errors: validationErrors } = validateVerifyInput(data);
    if (!isValid) {
      log.warn('Verify validation failed', { requestId, errors: validationErrors });
      return NextResponse.json(
        errorResponse(`Validation failed: ${validationErrors.join('; ')}`, requestId),
        { status: 400, headers: rateLimitHeaders }
      );
    }
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planId
    } = data;

    log.info('Verifying payment', { requestId, razorpay_order_id, userId, planId });



    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      log.error('RAZORPAY_KEY_SECRET is not defined', { requestId });
      return NextResponse.json(errorResponse('Server configuration error', requestId), { status: 500, headers: rateLimitHeaders });
    }

    const verificationBody = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(verificationBody)
      .digest('hex');

    // Signature comparison — do NOT log the actual signature values in production

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');

    const isAuthentic = expectedBuffer.length === receivedBuffer.length && 
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (isAuthentic) {
      log.info('Signature verified, updating profile', { requestId, userId, planId });
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      let expiresAt = null;
      let downloadsUsed = undefined;

      if (planId === 'single_download') {
        downloadsUsed = 0; // Reset downloads
      } else if (planId === 'monthly_subscription') {
        const d = new Date(); d.setMonth(d.getMonth() + 1);
        expiresAt = d.toISOString();
      } else if (planId === 'quarterly_subscription') {
        const d = new Date(); d.setMonth(d.getMonth() + 3);
        expiresAt = d.toISOString();
      } else if (planId === 'annual_subscription') {
        const d = new Date(); d.setFullYear(d.getFullYear() + 1);
        expiresAt = d.toISOString();
      }

      const updatePayload = {
        id: userId,
        subscription_tier: planId,
        updated_at: new Date().toISOString()
      };
      
      if (expiresAt) updatePayload.plan_expires_at = expiresAt;
      if (downloadsUsed !== undefined) updatePayload.downloads_used = downloadsUsed;

      const { error } = await supabase
        .from('profiles')
        .upsert(updatePayload, { onConflict: 'id' });

      if (error) {
        log.error('Supabase profile update failed', { requestId, userId, error: error.message });
        return NextResponse.json(errorResponse('Payment verified but profile update failed.', requestId), { status: 500, headers: rateLimitHeaders });
      }

      log.info('Profile updated successfully', { requestId, userId, planId });
      return NextResponse.json({ status: 'ok', requestId, timestamp: new Date().toISOString() }, { headers: rateLimitHeaders });
    } else {
      log.warn('Invalid payment signature', { requestId, userId });
      return NextResponse.json(errorResponse('Invalid payment signature. Verification failed.', requestId), { status: 401, headers: rateLimitHeaders });
    }
  } catch (error) {
    log.error('Verification error', { requestId, error: error.message });
    return NextResponse.json(errorResponse('Internal server error.', requestId), { status: 500 });
  }
}
