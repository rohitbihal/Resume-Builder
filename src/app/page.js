import Link from 'next/link';
import styles from './page.module.css';
import AuthNav from '@/components/AuthNav';

export default function Home() {
  return (
    <main className={styles.landing}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>CreativeResume</span>
          <div className={styles.navLinks}>
            <Link href="/templates" className={styles.navLink}>Templates</Link>
            <Link href="/pricing" className={styles.navLink}>Pricing</Link>
            <AuthNav />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✨ Free to build, preview & customize</div>
          <h1 className={styles.heroTitle}>
            Build Resumes That<br />
            <span className={styles.heroGradient}>Actually Get Noticed</span>
          </h1>
          <p className={styles.heroDesc}>
            Choose from 5 stunning creative templates. Toggle between Fresher and Experienced tracks.
            Add unlimited custom sections. Download premium PDFs.
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
              <span className={styles.statNum}>2</span>
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
          <h2 className={styles.sectionTitle}>Why CreativeResume?</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: '🎯', title: 'Smart Track Switcher', desc: 'Fresher or Experienced? Toggle once — sections adapt automatically.' },
              { icon: '🎨', title: '5 Creative Templates', desc: 'Bold Neo, Grid Master, Viva Color, TypeForge, Ink Splash — designed to impress.' },
              { icon: '✨', title: 'Custom Sections', desc: 'Add unlimited sections with custom titles and rich-text bullets.' },
              { icon: '📱', title: 'Live Preview', desc: 'See your resume update in real-time as you type.' },
              { icon: '📄', title: 'PDF Download', desc: 'Export pixel-perfect PDFs ready for any job application.' },
              { icon: '🔒', title: 'Premium Plans', desc: 'From single downloads to unlimited access — pick your plan.' },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
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
            {[
              { name: 'Bold Neo', color: '#00FFE0', desc: 'High-contrast B&W with neon accent' },
              { name: 'Grid Master', color: '#B39DDB', desc: 'Magazine-style grid layout' },
              { name: 'Viva Color', color: '#FF6B6B', desc: 'Warm gradient sidebar' },
              { name: 'TypeForge', color: '#2D2D2D', desc: 'Typography-first minimal', light: true },
              { name: 'Ink Splash', color: '#5BBFB5', desc: 'Artistic watercolor feel' },
            ].map((t) => (
              <div key={t.name} className={styles.templateCard}>
                <div className={styles.templatePreview} style={{ background: t.color }}>
                  <span style={{ color: t.light ? '#fff' : '#1a1a1a', fontWeight: 700, fontSize: '1.2rem' }}>{t.name}</span>
                </div>
                <h4 className={styles.templateName}>{t.name}</h4>
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
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>CreativeResume</span>
          <span className={styles.footerText}>© 2026 CreativeResume. Craft your story.</span>
        </div>
      </footer>
    </main>
  );
}
