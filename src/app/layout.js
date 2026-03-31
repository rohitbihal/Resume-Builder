import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import { ResumeProvider } from "@/context/ResumeContext";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://creativeresume.vercel.app'),
  title: {
    default: "Free Resume Builder - Create Professional Resumes Online | CreativeResume",
    template: "%s | CreativeResume"
  },
  description: "Build a professional resume in minutes with our free online resume builder. Choose from stunning creative templates, customize every section, and download ATS-friendly PDFs.",
  keywords: "resume builder, free resume builder, online resume maker, resume templates, creative resume, ATS-friendly resume, professional CV maker",
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Free Resume Builder - Create Professional Resumes Online',
    description: 'Build beautiful, ATS-friendly resumes in minutes with our free online resume builder.',
    siteName: 'CreativeResume',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'CreativeResume Preview'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Resume Builder - Create Professional Resumes Online',
    description: 'Build beautiful, ATS-friendly resumes in minutes with our free online resume builder.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <ResumeProvider>
          <GoogleAnalytics ga_id="G-7M6E4NRTX7" />
          {children}
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
        </ResumeProvider>
      </body>
    </html>
  );
}
