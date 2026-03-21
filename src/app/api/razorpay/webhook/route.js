import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin outside the handler to check for keys once
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not defined');
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
      console.warn('Invalid Razorpay Webhook Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Razorpay Webhook Event:', event.event);

    // Handle payment.captured or order.paid
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      const notes = payment.notes;
      const userId = notes.userId;
      const planId = notes.planId;

      if (!userId || userId === 'anonymous') {
        console.warn('Webhook received for anonymous user or missing userId');
        return NextResponse.json({ status: 'ignored_no_user' });
      }

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Supabase keys missing in webhook handler');
        return NextResponse.json({ error: 'Database config missing' }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Update user profile to pro
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId,
          subscription_tier: 'pro',
          last_payment_id: payment.id,
          last_payment_amount: payment.amount / 100,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        console.error('Webhook: Failed to update profile:', error);
        return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
      }

      console.log(`Successfully upgraded user ${userId} to Pro plan via webhook.`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
