export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creative-resume.vercel.app';

  const routes = [
    '',
    '/pricing',
    '/templates',
    '/auth',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
