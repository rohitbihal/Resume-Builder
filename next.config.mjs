/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @sparticuz/chromium-min to work in Vercel functions
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core', 'pdf-parse'],
};

export default nextConfig;
