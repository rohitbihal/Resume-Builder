export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creative-resume.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/builder/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
