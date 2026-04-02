export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://resume-builder-gilt-theta-32.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
