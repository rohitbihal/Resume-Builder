import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { errorResponse, successResponse } from '@/lib/validate';

const log = logger('api/stripe/checkout');
export const maxDuration = 60;

export async function POST(req) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId, method: 'POST' });

  // 1. Get user session safely from auth header
  const authHeader = req.headers.get('Authorization') || '';
  let token = null;
  let jwtUserId = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) jwtUserId = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8')).sub || null;
    } catch {}
  }

  // ─── Rate Limiting (Payment Tier) ───────────────────────────────────
  const { success: rateLimitOk, headers: rateLimitHeaders } = rateLimiter(req, 'payment', jwtUserId);
  if (!rateLimitOk) {
    log.warn('Payment rate limit exceeded', { requestId, userId: jwtUserId });
    return NextResponse.json(
      errorResponse('Too many payment attempts. Please wait.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    const { planId, resumeId, templateId } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let userEmail = 'guest@example.com';
    let userId = jwtUserId || 'guest_id';

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userEmail = user.email;
        userId = user.id;
      }
    }

    // 2. Define our price map (Placeholders - these would normally be Stripe Price IDs)
    const priceMap = {
      'single_download': { amount: 4900, name: 'Single Premium Resume Download (No Watermark)' },
      'monthly': { amount: 19900, name: 'CreativeResume Monthly Subscription' },
      'quarterly': { amount: 49900, name: 'CreativeResume Quarterly Subscription' },
      'annual': { amount: 149900, name: 'CreativeResume Annual Subscription' },
    };

    const selectedPlan = priceMap[planId];
    if (!selectedPlan) {
      log.warn('Invalid plan selected for checkout', { requestId, planId });
      return NextResponse.json(errorResponse('Invalid plan selected', requestId), { status: 400, headers: rateLimitHeaders });
    }

    // 3. Create Stripe Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    
    // Determine if it's a subscription or one-time payment
    const mode = planId === 'single_download' ? 'payment' : 'subscription';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail !== 'guest@example.com' ? userEmail : undefined,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: selectedPlan.name,
              description: resumeId ? `For resume ${resumeId}` : 'Full SaaS Access',
            },
            unit_amount: selectedPlan.amount,
            ...(mode === 'subscription' && {
              recurring: {
                interval: planId === 'monthly' ? 'month' : planId === 'annual' ? 'year' : 'month',
                interval_count: planId === 'quarterly' ? 3 : 1
              }
            })
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${origin}/builder?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId,
        planId,
        resumeId: resumeId || '',
        templateId: templateId || ''
      },
    });

    log.info('Checkout session created', { requestId, sessionId: session.id, durationMs: Date.now() - startTime });
    return NextResponse.json({ url: session.url }, { status: 200, headers: rateLimitHeaders });

  } catch (error) {
    log.error('Stripe checkout error', { requestId, error: error.message });
    return NextResponse.json(errorResponse('Internal Server Error', requestId), { status: 500, headers: typeof rateLimitHeaders !== 'undefined' ? rateLimitHeaders : {} });
  }
}
