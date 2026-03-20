import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { description, company, title } = await req.json();

    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const prompt = `
      You are an expert executive resume writer and career coach.
      I will provide you with a draft description of a job experience.
      Your goal is to rewrite this into 3 to 4 highly professional, impactful, and ATS-friendly bullet points.
      Use strong action verbs, quantify achievements where possible or imply scale, and focus on results.
      
      Context:
      Company: ${company || 'Unknown'}
      Job Title: ${title || 'Professional'}

      Draft Description:
      ${description}

      Rules:
      1. Return ONLY the rewritten bullet points as plain text.
      2. Start each line with the "• " character (a bullet).
      3. Do NOT include introductory text (like "Here are the bullet points:") or markdown code blocks.
      4. Ensure the tone is highly professional and concise.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    
    // Safety cleanup in case Gemini returns markdown or intro text
    content = content.replace(/```.*/g, '').trim();

    return NextResponse.json({ enhancedText: content });

  } catch (error) {
    console.error('Enhance Bullets Error:', error);
    return NextResponse.json({ error: 'Failed to enhance description: ' + error.message }, { status: 500 });
  }
}
