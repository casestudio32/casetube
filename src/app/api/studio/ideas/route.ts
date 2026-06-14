import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json();

    const memory = userId
      ? await db.creatorMemory.findUnique({ where: { userId } })
      : null;

    const context = memory
      ? `Niche: ${memory.niche}. Audience: ${memory.targetAudience}. Content pillars: ${memory.contentPillars?.join(", ")}.`
      : "";

    const prompt = `You are a YouTube content strategist. Generate 10 high-performing video ideas${topic ? ` about "${topic}"` : " based on the creator's niche"}.

${context}

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "Compelling video title",
      "hook": "The opening line that grabs attention in the first 5 seconds",
      "angle": "The unique angle that makes this different from existing videos",
      "format": "Tutorial | List | Story | Case Study | Reaction | Interview | Challenge",
      "estimatedLength": "8-12 mins",
      "difficulty": "Easy | Medium | Hard",
      "potential": "High | Medium | Low",
      "whyItWorks": "One sentence on why this video will perform well"
    }
  ]
}

Make ideas specific, not generic. Vary the formats. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      maxTokens: 2500,
    });

    let raw = response.content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
