import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { planId, resumeId, templateId } = await req.json();

    // 1. Get user session from auth header
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    // Need a non-anon key for admin verification if we want to be secure, 
    // but for demo we can parse the JWT directly or use the anon client with the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let userEmail = 'guest@example.com';
    let userId = 'guest_id';

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
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
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

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
