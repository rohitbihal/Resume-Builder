import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { jobTitle, summary, experience } = await req.json();

    const expText = (experience || []).map(exp => `${exp.title} at ${exp.company}: ${exp.description}`).join(' | ');

    const prompt = `
      You are an expert technical recruiter and career coach.
      Analyze the following resume details to suggest exactly 8 highly relevant professional skills.
      Return the skills as a strictly valid JSON array of strings. No markdown formatting, just the array.
      Exclude soft skills like "Communication" or "Hard worker". Focus on hard skills, tools, methodologies, and technical competencies.
      
      Job Title: ${jobTitle || 'Unknown'}
      Summary: ${summary || 'None'}
      Experience: ${expText || 'None'}

      Example format: ["React.js", "Node.js", "Project Management", "Agile", "SQL"]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    
    // Clean up possible markdown
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    const skillsArray = JSON.parse(content);

    return NextResponse.json({ skills: skillsArray });

  } catch (error) {
    console.error('Suggest Skills Error:', error);
    return NextResponse.json({ error: 'Failed to suggest skills: ' + error.message }, { status: 500 });
  }
}
