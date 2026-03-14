import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 422 });
    }

    // Call Claude to parse the text into our schema
    const prompt = `
      You are an expert resume parser. I will provide you with raw text extracted from a LinkedIn PDF resume.
      Your goal is to extract the information and return it in a strictly valid JSON format that matches the following schema:

      {
        "personalInfo": {
          "firstName": "",
          "lastName": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "website": "",
          "jobTitle": ""
        },
        "executiveSummary": "",
        "workExperience": [
          {
            "id": "unique-id",
            "company": "",
            "position": "",
            "location": "",
            "startDate": "",
            "endDate": "",
            "description": ""
          }
        ],
        "education": [
          {
            "id": "unique-id",
            "school": "",
            "degree": "",
            "field": "",
            "location": "",
            "startDate": "",
            "endDate": "",
            "gpa": "",
            "cgpa": ""
          }
        ],
        "skills": [
          {
            "id": "unique-id",
            "name": "",
            "level": "Beginner|Intermediate|Advanced|Expert"
          }
        ],
        "certifications": [
           {"id": "id", "name": "", "issuer": "", "date": ""}
        ]
      }

      Rules:
      1. Return ONLY the JSON object. No preamble, no explanation.
      2. Generate unique IDs (short strings) for each item in arrays.
      3. If a field is not found, leave it as an empty string or empty array.
      4. Ensure dates are in a readable format (e.g., "Jan 2020").
      5. Correct capitalization and clean up the text.

      Raw Text:
      ${rawText}
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].text;
    
    // Attempt to parse the JSON
    try {
      const parsedData = JSON.parse(content.trim());
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Claude JSON Parse Error:', parseError, content);
      return NextResponse.json({ 
        error: 'Failed to parse AI response into JSON',
        raw: content 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('LinkedIn Parse Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
