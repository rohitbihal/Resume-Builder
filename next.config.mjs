/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse', '@sparticuz/chromium', 'puppeteer-core'],
};

export default nextConfig;
