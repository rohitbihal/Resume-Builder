import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";

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
  title: "CreativeResume — Build Stunning Resumes",
  description: "Build beautiful, ATS-friendly resumes with creative templates. Choose your track, customize every section, and download premium PDFs.",
  keywords: "resume builder, creative resume, CV maker, professional resume, fresher resume, experienced resume",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <GoogleAnalytics ga_id="AIzaSyCbZE_4NYxWhaSARdXrhUyFVIuBSSA1Lkk" />
        {children}
      </body>
    </html>
  );
}
