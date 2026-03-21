import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

export async function POST(req) {
  try {
    const bodyText = await req.text();
    const data = JSON.parse(bodyText);
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planId
    } = data;

    console.log('Verifying Payment:', { razorpay_order_id, razorpay_payment_id, userId, planId });

    if (!razorpay_signature) {
      console.error('Missing razorpay_signature');
      return NextResponse.json({ error: 'Missing payment signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET is not defined in environment');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const verificationBody = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(verificationBody)
      .digest('hex');

    console.log('Signatures:', { expected: expectedSignature, received: razorpay_signature });

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');

    const isAuthentic = expectedBuffer.length === receivedBuffer.length && 
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (isAuthentic) {
      console.log('Signature Verified. Updating Supabase for user:', userId);
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Update user profile to pro
      // We also store the planId if needed in the future
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'pro',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: 'Payment verified but profile update failed: ' + error.message }, { status: 500 });
      }

      console.log('Profile updated successfully to pro');
      return NextResponse.json({ status: 'ok' });
    } else {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
