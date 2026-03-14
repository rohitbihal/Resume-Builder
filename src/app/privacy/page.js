import Link from 'next/link';
import Logo from '@/components/Branding/Logo';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: 'var(--cr-text)', lineHeight: '1.6' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--cr-border)', paddingBottom: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
      </header>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Privacy Policy</h1>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Last Updated: March 14, 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Introduction</h2>
        <p>Welcome to CreativeResume. At CreativeResume, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Data We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul>
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
          <li><strong>Resume Data</strong> includes all information you input into your resume, such as employment history, education, and skills.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
          <li>To provide you with our resume building services.</li>
          <li>To manage your account and authentication via Google OAuth or Email.</li>
          <li>To process payments via Razorpay.</li>
          <li>To improve our website and services.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Data Security</h2>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use Supabase for secure data storage and Row Level Security (RLS) to ensure you only access your own data.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. Third-Party Services</h2>
        <p>We use third-party services to provide our functionality:</p>
        <ul>
          <li><strong>Supabase</strong> for database and authentication.</li>
          <li><strong>Razorpay</strong> for payment processing.</li>
          <li><strong>Anthropic (Claude AI)</strong> for LinkedIn parsing (data is sent anonymously for processing).</li>
          <li><strong>Google OAuth</strong> for easy login.</li>
        </ul>
      </section>

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--cr-border)' }}>
        <Link href="/" style={{ color: 'var(--cr-primary)', textDecoration: 'none' }}>← Back to Home</Link>
      </footer>
    </div>
  );
}
