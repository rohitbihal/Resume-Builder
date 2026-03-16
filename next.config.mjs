/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @sparticuz/chromium to work in Vercel functions
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', 'pdf-parse'],
};

export default nextConfig;
