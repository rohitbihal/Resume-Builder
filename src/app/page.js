import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Branding/Logo';

export default function Home() {
  const templates = [
    { name: 'Bold Neo', image: '/templates/bold-neo.png', desc: 'High-contrast B&W with neon accent' },
    { name: 'Grid Master', image: '/templates/grid-master.png', desc: 'Magazine-style grid layout' },
    { name: 'Viva Color', image: '/templates/viva-color.png', desc: 'Warm gradient sidebar' },
    { name: 'TypeForge', image: '/templates/typeforge.png', desc: 'Typography-first minimal' },
    { name: 'Ink Splash', image: '/templates/ink-splash.png', desc: 'Artistic watercolor feel' },
  ];

  return (
    <main className={styles.landing}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✨ Free to build, preview & customize</div>
          <h1 className={styles.heroTitle}>
            Free <span className={styles.heroGradient}>Resume Builder</span><br />
            Create Your Professional Resume in Minutes
          </h1>
          <p className={styles.heroDesc}>
            Our free resume builder helps you build beautiful, ATS-friendly resumes with stunning creative templates. 
            Choose your track, customize every section, and download premium PDFs for free.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/builder" className="cr-btn cr-btn-primary cr-btn-lg" id="hero-cta-btn">
              🚀 Start Building — It{"'"}s Free
            </Link>
            <Link href="/templates" className="cr-btn cr-btn-secondary cr-btn-lg">
              View Templates
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>5</span>
              <span className={styles.statLabel}>Creative Templates</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>6</span>
              <span className={styles.statLabel}>Career Tracks</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>∞</span>
              <span className={styles.statLabel}>Custom Sections</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="cr-container">
          <h2 className={styles.sectionTitle}>Built for Professionals</h2>
          <div className={styles.featureGrid}>
            {[
              { title: 'Smart Track Switcher', desc: 'Choose from specialized roles: Professional, Fresher, Freelancer, Academic, Designer, or Career Switcher.' },
              { title: 'Premium Design Templates', desc: 'Crafted with precision — Bold Neo, Grid Master, Viva Color, TypeForge, and Ink Splash.' },
              { title: 'Custom Content Sections', desc: 'Add unlimited sections with personalized titles and rich-text editing.' },
              { title: 'Interactive Live Editor', desc: 'Real-time updates as you build your resume, ensuring every detail is perfect.' },
              { title: 'Simplified PDF Export', desc: 'Download high-quality, ATS-ready PDFs instantly.' },
              { title: 'Flexible Subscription Plans', desc: 'Choose the right plan that fits your career goals.' },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className={styles.templateSection}>
        <div className="cr-container">
          <h2 className={styles.sectionTitle}>Stunning Templates</h2>
          <p className={styles.sectionDesc}>Each template is carefully crafted for maximum visual impact.</p>
          <div className={styles.templateCards}>
            {templates.map((t) => (
              <div key={t.name} className={styles.templateCard}>
                <div className={styles.templatePreview}>
                  <Image 
                    src={t.image} 
                    alt={`${t.name} Template Preview`} 
                    fill 
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                  />
                </div>
                <h3 className={styles.templateName}>{t.name}</h3>
                <p className={styles.templateDesc}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>Ready to Stand Out?</h2>
        <p className={styles.ctaDesc}>Build your creative resume in minutes — no sign-up required.</p>
        <Link href="/builder" className="cr-btn cr-btn-primary cr-btn-lg" id="bottom-cta-btn">
          Start Building Now →
        </Link>
      </section>

      {/* Footer */}
          <Logo size="sm" />
          <div className={styles.footerLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className={styles.footerBlogLinks} style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/blog/how-to-write-resume" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resume Guide</Link>
            <Link href="/blog/best-resume-templates" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Best Templates</Link>
            <Link href="/blog/resume-tips" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resume Tips</Link>
            <Link href="/blog/ats-friendly-resume" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ATS Guide</Link>
            <Link href="/blog/college-student-resume" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Student Guide</Link>
          </div>
          <span className={styles.footerText}>© 2026 CreativeResume. Craft your story.</span>
    </main>
  );
}
