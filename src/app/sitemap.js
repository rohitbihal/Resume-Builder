export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://resume-builder-gilt-theta-32.vercel.app';

  const routes = [
    '',
    '/builder',
    '/templates',
    '/blog/how-to-write-resume',
    '/blog/best-resume-templates',
    '/blog/resume-tips',
    '/blog/ats-friendly-resume',
    '/blog/college-student-resume',
    '/pricing',
    '/auth',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route.startsWith('/blog') ? 'monthly' : 'weekly',
    priority: route === '' ? 1 : (route.startsWith('/blog') ? 0.7 : 0.8),
  }));

  return routes;
}
