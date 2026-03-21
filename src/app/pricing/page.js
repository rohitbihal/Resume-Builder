'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './pricing.module.css';
import Navbar from '@/components/Navbar';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    amount: 0,
    period: 'forever',
    description: 'Build, preview, and customize your resume',
    features: [
      'Full resume builder',
      'Live preview',
      'All 5 templates (preview)',
      'Unlimited custom sections',
      'Watermark on download',
    ],
    cta: 'Start Free',
    href: '/builder',
    popular: false,
    accent: 'var(--cr-success)',
  },
  {
    id: 'single_download',
    name: 'Single Download',
    price: '₹49',
    amount: 49,
    period: 'one-time',
    description: 'Download a single resume without watermark',
    features: [
      'Everything in Free',
      '1 PDF download',
      'No watermark',
      '1 premium template',
      'No expiry',
    ],
    cta: 'Buy Download',
    href: '#',
    popular: false,
    accent: 'var(--cr-info)',
  },
  {
    id: 'monthly_subscription',
    name: 'Monthly',
    price: '₹199',
    amount: 199,
    period: '/month',
    description: 'Full access to all templates and downloads',
    features: [
      'Everything in Free',
      'Unlimited PDF downloads',
      'All premium templates',
      'No watermark',
      'Priority support',
    ],
    cta: 'Subscribe Monthly',
    href: '#',
    popular: true,
    accent: 'var(--cr-accent-primary)',
  },
  {
    id: 'quarterly_subscription',
    name: 'Quarterly',
    price: '₹499',
    amount: 499,
    period: '/3 months',
    description: 'Save 16% with a quarterly plan',
    features: [
      'Everything in Monthly',
      '3 months of access',
      'Save ₹98 vs monthly',
      'All future templates',
      'Priority support',
    ],
    cta: 'Go Quarterly',
    href: '#',
    popular: false,
    accent: '#a855f7',
  },
  {
    id: 'annual_subscription',
    name: 'Annual',
    price: '₹1,499',
    amount: 1499,
    period: '/year',
    description: 'Best value — save 37%',
    features: [
      'Everything in Monthly',
      '12 months of access',
      'Save ₹889 vs monthly',
      'All future templates',
      'VIP support',
    ],
    cta: 'Go Annual',
    href: '#',
    popular: false,
    accent: '#ec4899',
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(null);

  const handleSubscription = async (plan) => {
    if (plan.id === 'free') return;
    
    setLoading(plan.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please login to continue');
        window.location.href = `/auth?redirect=/pricing`;
        return;
      }

      // Create order
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.amount, planId: plan.id, userId: session.user.id }),
      });
      const order = await res.json();

      if (!order.id) throw new Error(order.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'CreativeResume',
        description: `${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId: session.user.id,
                planId: plan.id
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === 'ok') {
              alert('Payment successful! Your premium access is now active.');
              window.location.href = '/builder';
            } else {
              alert('Payment verification failed: ' + (verifyData.error || 'Unknown error'));
            }
          } catch (err) {
            console.error('Verification call failed:', err);
            alert('Payment was successful but we could not verify it. Please contact support with your payment ID: ' + response.razorpay_payment_id);
          }
        },
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: '#00B8A9',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className={styles.pricing} style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <section className={styles.hero}>
        <h1 className={styles.title}>Premium Resume Templates</h1>
        <p className={styles.subtitle}>
          Choose the plan that fits your career goals.
        </p>
      </section>

      <div className="cr-container">
        <section className={styles.grid}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
              style={{ '--plan-accent': plan.accent }}
            >
              {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.priceRow}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              <p className={styles.planDesc}>{plan.description}</p>
              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <span className={styles.featureCheck}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.id === 'free' ? (
                <Link href={plan.href} className={`${styles.planCta} ${plan.popular ? styles.planCtaPrimary : ''}`}>
                  {plan.cta}
                </Link>
              ) : (
                <button 
                  onClick={() => handleSubscription(plan)}
                  disabled={loading === plan.id}
                  className={`${styles.planCta} ${plan.popular ? styles.planCtaPrimary : ''}`}
                  style={{ width: '100%', border: 'none', cursor: 'pointer' }}
                >
                  {loading === plan.id ? 'Processing...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </section>
      </div>

      <section className={styles.faq}>
        <div className="cr-container">
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {[
              { q: 'Can I try before I pay?', a: 'Yes! Build and preview your resume with all templates completely free.' },
              { q: 'What happens after payment?', a: 'Your account is immediately upgraded to PRO, enabling watermark-free downloads.' },
              { q: 'Is it a one-time payment?', a: 'We offer both one-time "Single Download" and recurring subscription options.' },
              { q: 'Need help?', a: 'Contact our support team if you face any issues with your payment.' },
            ].map((item) => (
              <div key={item.q} className={styles.faqItem}>
                <h4 className={styles.faqQuestion}>{item.q}</h4>
                <p className={styles.faqAnswer}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
