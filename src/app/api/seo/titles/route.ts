import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const { topic, keyword, userId } = await req.json();

    const memory = userId
      ? await db.creatorMemory.findUnique({ where: { userId } })
      : null;

    const context = memory
      ? `Brand voice: ${memory.brandVoice}. Niche: ${memory.niche}. Audience: ${memory.targetAudience}.`
      : "";

    const prompt = `You are a YouTube title expert who has studied thousands of viral videos. Generate optimized YouTube titles for:

Topic: "${topic}"
${keyword ? `Target keyword: "${keyword}"` : ""}
${context}

Return ONLY valid JSON:
{
  "titles": [
    {
      "title": "The exact title",
      "type": "Curiosity | How-To | List | Story | Controversy | Benefit",
      "score": 92,
      "reasoning": "Why this title will perform well",
      "keyword": "the keyword naturally included"
    }
  ],
  "tips": ["Tip 1 about this specific topic", "Tip 2", "Tip 3"]
}

Generate 8 title options across different types. Score each from 1-100. Include the target keyword naturally in most titles. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      maxTokens: 1500,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 });
  }
}
