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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "CreativeResume — Build Stunning Resumes",
  description: "Build beautiful, ATS-friendly resumes with creative templates. Choose your track, customize every section, and download premium PDFs.",
  keywords: "resume builder, creative resume, CV maker, professional resume, fresher resume, experienced resume",
  openGraph: {
    type: 'website',
    url: '/',
    title: 'CreativeResume — Build Stunning Resumes',
    description: 'Build beautiful, ATS-friendly resumes with creative templates.',
    siteName: 'CreativeResume',
    images: [{
      url: '/og-image.png', // Fallback image (if provided)
      width: 1200,
      height: 630,
      alt: 'CreativeResume Preview'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreativeResume — Build Stunning Resumes',
    description: 'Build beautiful, ATS-friendly resumes with creative templates.',
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
