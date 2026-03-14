'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './pricing.module.css';

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
        window.location.href = '/auth?redirect=/pricing';
        return;
      }

      // Create order
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.amount, planId: plan.id }),
      });
      const order = await res.json();

      if (!order.id) throw new Error('Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'CreativeResume',
        description: `${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
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
            alert('Payment successful! You are now a PRO user.');
            window.location.href = '/builder';
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className={styles.pricing}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>CreativeResume</Link>
          <div className={styles.navLinks}>
            <Link href="/builder" className={styles.navLink}>Builder</Link>
            <Link href="/templates" className={styles.navLink}>Templates</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <h1 className={styles.title}>Simple, Transparent Pricing</h1>
        <p className={styles.subtitle}>
          Build for free. Pay only when you download. Cancel anytime.
        </p>
      </section>

      <section className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
            style={{ '--plan-accent': plan.accent }}
            id={`plan-${plan.name.toLowerCase().replace(/\s/g, '-')}`}
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
                {loading === plan.id ? 'Loading...' : plan.cta}
              </button>
            )}
          </div>
        ))}
      </section>

      <section className={styles.faq}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {[
            { q: 'Can I try before I pay?', a: 'Yes! Build and preview your resume with all templates completely free. You only pay when you download.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and net banking via Razorpay.' },
            { q: 'Can I cancel my subscription?', a: 'Absolutely. Cancel anytime from your dashboard. You\'ll retain access until the end of your billing period.' },
            { q: 'What happens to my data?', a: 'Your resume data is stored securely in your account. Even on the free plan, your data is never deleted.' },
          ].map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>{item.q}</h4>
              <p className={styles.faqAnswer}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
