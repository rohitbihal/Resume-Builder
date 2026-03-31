import { blogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <main className={styles.blogPage}>
      <Navbar />
      
      <article className={styles.article}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <div className={styles.meta}>
            <span className={styles.date}>{new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.description}</p>
        </header>

        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ 
            // Simple markdown-to-html conversion for H2, H3, Bold, and Lists
            __html: post.content
              .replace(/### (.*)/g, '<h3>$1</h3>')
              .replace(/## (.*)/g, '<h2>$1</h2>')
              .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
              .replace(/\[(.*)\]\((.*)\)/g, '<a href="$2">$1</a>')
              .split('\n')
              .map(line => line.trim() ? `<p>${line.trim()}</p>` : '')
              .join('')
              .replace(/<p><h2>(.*)<\/h2><\/p>/g, '<h2>$1</h2>')
              .replace(/<p><h3>(.*)<\/h3><\/p>/g, '<h3>$1</h3>')
          }}
        />

        <footer className={styles.footer}>
          <div className={styles.cta}>
            <h3>Ready to build your own?</h3>
            <p>Our free resume builder is the easiest way to create a professional CV in minutes.</p>
            <Link href="/builder" className="cr-btn cr-btn-primary">
              Build Your Resume Now — It's Free
            </Link>
          </div>
        </footer>
      </article>
      
      <div className={styles.sidebar}>
        <h3>More Guides</h3>
        <ul>
          {Object.entries(blogPosts)
            .filter(([s]) => s !== slug)
            .map(([s, p]) => (
              <li key={s}>
                <Link href={`/blog/${s}`}>{p.title}</Link>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
