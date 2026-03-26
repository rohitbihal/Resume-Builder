import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Allow up to 60 seconds on Vercel

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable is not set.');
      return NextResponse.json(
        { error: 'Server configuration error: GEMINI_API_KEY is not set. Please add it to your Vercel environment variables.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { resumeData, jobDescription } = await req.json();

    if (!resumeData || !jobDescription) {
      return NextResponse.json({ error: 'Resume data and Job Description are required' }, { status: 400 });
    }

    const prompt = `
      You are an expert career coach and professional writer.
      Your goal is to write a highly persuasive, professional, and tailored cover letter for a candidate.
      
      Candidate Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Target Job Description:
      ${jobDescription}

      Rules:
      1. Write a 3-4 paragraph cover letter.
      2. Use a professional tone.
      3. Align the candidate's skills and experience with the requirements in the job description.
      4. Highlight specific achievements from the resume that match the job.
      5. Include placeholders for [Recipient Name], [Company Name], and [Date] if they aren't provided.
      6. Return ONLY the cover letter text. No introductory or concluding remarks from you.
      7. Format with clear line breaks between paragraphs.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    
    // Safety cleanup
    content = content.replace(/```.*/g, '').trim();

    return NextResponse.json({ coverLetter: content });

  } catch (error) {
    console.error('Cover Letter Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter: ' + error.message }, { status: 500 });
  }
}
