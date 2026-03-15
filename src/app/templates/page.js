import Link from 'next/link';
import styles from './templates.module.css';
import Navbar from '@/components/Navbar';

const TEMPLATES = [
  {
    id: 'bold-neo',
    name: 'Bold Neo',
    description: 'Extra-bold sans-serif headings with a high-contrast black and white scheme. A neon cyan accent bar runs vertically, giving a bold, contemporary feel.',
    color1: '#00FFE0',
    color2: '#00B8A9',
    premium: false,
    tags: ['Minimal', 'High Contrast', 'Modern'],
  },
  {
    id: 'grid-master',
    name: 'Grid Master',
    description: 'Magazine-style grid layout with asymmetric columns and soft pastel lavender accents. Features timeline dots and skill tag chips.',
    color1: '#B39DDB',
    color2: '#E8DEFF',
    premium: false,
    tags: ['Editorial', 'Grid', 'Pastel'],
  },
  {
    id: 'viva-color',
    name: 'Viva Color',
    description: 'Warm gradient sidebar flowing from coral to amber. Circular skill indicators and colorful timeline markers make this template pop.',
    color1: '#FF6B6B',
    color2: '#FFD93D',
    premium: true,
    tags: ['Vibrant', 'Warm', 'Gradient'],
  },
  {
    id: 'typeforge',
    name: 'TypeForge',
    description: 'Typography-first design with a massive display name spanning the full width. Strict two-tone color scheme with subtle gray section backgrounds.',
    color1: '#2D2D2D',
    color2: '#F5F5F5',
    premium: true,
    tags: ['Typography', 'Minimal', 'Elegant'],
  },
  {
    id: 'ink-splash',
    name: 'Ink Splash',
    description: 'Artistic design with watercolor-inspired decorative elements in teal, dusty rose, and muted gold. Serif headings with hand-drawn underline strokes.',
    color1: '#5BBFB5',
    color2: '#D4A5A5',
    premium: true,
    tags: ['Artistic', 'Creative', 'Unique'],
  },
];

export default function TemplatesPage() {
  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <h1 className={styles.title}>Creative Templates</h1>
        <p className={styles.subtitle}>5 handcrafted designs to make your resume unforgettable</p>
      </section>

      <section className={styles.grid}>
        {TEMPLATES.map((t) => (
          <div key={t.id} className={styles.card} id={`template-card-${t.id}`}>
            <div className={styles.cardPreview} style={{ background: `linear-gradient(135deg, ${t.color1}, ${t.color2})` }}>
              <span className={styles.previewLabel}>{t.name}</span>
              {t.premium && <span className="cr-badge cr-badge-premium">Premium</span>}
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>{t.name}</h3>
              <p className={styles.cardDesc}>{t.description}</p>
              <div className={styles.cardTags}>
                {t.tags.map((tag) => (
                  <span key={tag} className={styles.cardTag}>{tag}</span>
                ))}
              </div>
              <Link href="/builder" className={styles.cardCta}>
                Use This Template →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
