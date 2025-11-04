// /pages/api/rephrase.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

// NOTE: set GOOGLE_API_KEY in your .env.local (never expose this to the client)
const apiKey = process.env.GOOGLE_API_KEY as string;

const SYSTEM_INSTRUCTIONS = `
You are a helpful editor. Rephrase the given text in simple, human, layman language.
- Keep it friendly and concise (2–5 sentences).
- Avoid jargon and numerology slang; explain plainly.
- Keep the meaning intact.
- Output plain text only.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!apiKey) return res.status(500).json({ error: "Missing GOOGLE_API_KEY" });

  try {
    const { text, locale = "en" } = JSON.parse(req.body || "{}");
    if (!text || typeof text !== "string") return res.status(400).json({ error: "text is required" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${SYSTEM_INSTRUCTIONS}\n\nLocale: ${locale}\n\nOriginal:\n${text}\n\nLayman version:`;
    const result = await model.generateContent(prompt);
    const out = result.response.text().trim();

    // tiny guard: if model returns empty, fall back to original text
    res.status(200).json({ ok: true, text: out || text });
  } catch (err: any) {
    console.error("Rephrase error:", err);
    res.status(200).json({ ok: false, text: null, error: "REPHRASE_FAILED" });
  }
}
