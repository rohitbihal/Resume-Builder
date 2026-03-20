# CreativeResume — Build Stunning Resumes

Build beautiful, ATS-friendly resumes with creative templates. Choose your track, customize every section, and download premium PDFs.

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)** to see the result.

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file (for development) and to your Vercel/Production environment:

| Variable | Description | Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Supabase Dashboard > Settings > API |
| `GEMINI_API_KEY` | Google Gemini AI API Key | [Google AI Studio](https://aistudio.google.com/) |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_SECRET` | Razorpay Secret Key | Razorpay Dashboard > Settings > API Keys |

---

## ✨ Features (The "Hero" Upgrade)
- **AI Bullet Point Enhancer:** Professional rewriting of work experience.
- **Smart Skill Suggestions:** AI-powered technical skill discovery.
- **Real-time ATS Score:** Instant feedback on resume quality.
- **Global Theme Controls:** One-click font and color customization.
- **Public Resume Sharing:** Unique links with dynamic QR codes.
- **AI Cover Letter Generator:** Tailored letters matching your resume style.
- **Interactive Onboarding:** Professional wizard for new users.

## 🛠️ Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Backend:** Supabase (Auth, DB)
- **AI:** Google Gemini 1.5
- **PDF Engine:** Puppeteer + Chromium
- **Styling:** CSS Modules
