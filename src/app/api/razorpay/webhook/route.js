import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { logger, getRequestId } from '@/lib/logger';

const log = logger('api/razorpay/webhook');

// Initialize Supabase Admin outside the handler to check for keys once
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export const maxDuration = 60;

export async function POST(req) {
  const requestId = getRequestId(req);
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Guard: reject immediately if signature header is missing
    if (!signature) {
      log.warn('Webhook rejected: missing x-razorpay-signature header', { requestId });
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    if (!webhookSecret) {
      log.error('RAZORPAY_WEBHOOK_SECRET is not defined', { requestId });
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    const signatureMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );

    if (!signatureMatch) {
      log.warn('Invalid Razorpay webhook signature', { requestId });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    log.info('Webhook event received', { requestId, event: event.event });

    // Handle payment.captured or order.paid
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      const notes = payment.notes;
      const userId = notes.userId;
      const planId = notes.planId;

      if (!userId || userId === 'anonymous') {
        log.warn('Webhook ignored: no userId in payment notes', { requestId, event: event.event });
        return NextResponse.json({ status: 'ignored_no_user' });
      }

      if (!supabaseUrl || !supabaseServiceKey) {
        log.error('Supabase keys missing in webhook handler', { requestId });
        return NextResponse.json({ error: 'Database config missing' }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

      // Default to pro for legacy plans that don't match the new enums
      const validTiers = ['single_download', 'monthly_subscription', 'quarterly_subscription', 'annual_subscription', 'pro'];
      const tierId = validTiers.includes(planId) ? planId : 'pro';

      const updatePayload = {
        id: userId,
        subscription_tier: tierId,
        last_payment_id: payment.id,
        last_payment_amount: payment.amount / 100,
        updated_at: new Date().toISOString()
      };
      
      if (expiresAt) updatePayload.plan_expires_at = expiresAt;
      if (downloadsUsed !== undefined) updatePayload.downloads_used = downloadsUsed;

      const { error } = await supabase
        .from('profiles')
        .upsert(updatePayload, { onConflict: 'id' });

      if (error) {
        log.error('Webhook: failed to update profile', { requestId, userId, error: error.message });
        return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
      }

      log.info(`User upgraded to Pro via webhook`, { requestId, userId, planId: notes.planId });
    }

    return NextResponse.json({ status: 'ok', requestId });
  } catch (error) {
    log.error('Webhook handler error', { requestId, error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
