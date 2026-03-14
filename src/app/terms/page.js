import Link from 'next/link';
import Logo from '@/components/Branding/Logo';

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: 'var(--cr-text)', lineHeight: '1.6' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--cr-border)', paddingBottom: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
      </header>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Terms of Service</h1>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Last Updated: March 14, 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Agreement to Terms</h2>
        <p>By accessing or using CreativeResume, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Description of Service</h2>
        <p>CreativeResume is a web-based resume builder that allows users to create, customize, and export professional resumes. Some features may require a paid subscription or separate purchase.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. User Conduct</h2>
        <p>You are responsible for the accuracy of the information you provide. You agree not to use the service for any illegal or unauthorized purposes.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Payments and Refunds</h2>
        <p>Payments are processed through Razorpay. Our current pricing is Rs. 199 per month for the Pro tier. Refunds are handled on a case-by-case basis in accordance with our refund policy.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. Intellectual Property</h2>
        <p>The templates and software provided by CreativeResume are the intellectual property of CreativeResume. You retain ownership of the content you input into your resumes.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>6. Limitation of Liability</h2>
        <p>CreativeResume shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.</p>
      </section>

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--cr-border)' }}>
        <Link href="/" style={{ color: 'var(--cr-primary)', textDecoration: 'none' }}>← Back to Home</Link>
      </footer>
    </div>
  );
}
