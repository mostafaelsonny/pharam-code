import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Hello Gemini, respond with OK if active.',
    });
    console.log('✅ Gemini API Response:', response.text);
  } catch (err) {
    console.error('❌ Gemini Error:', err.message);
  }
}

test();