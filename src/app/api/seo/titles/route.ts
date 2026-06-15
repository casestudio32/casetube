import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { topic, keyword, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Brand voice: ${memory.brandVoice}. Niche: ${memory.niche}. Audience: ${memory.targetAudience}.` : "";

    // Fetch real YouTube data
    const nicheQuery = memory?.niche ? `${topic} ${memory.niche}` : topic;
    const intel = await getNicheIntelligence(nicheQuery, topic);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube title expert. Generate 8 optimised titles for: "${topic}"
${keyword ? `Target keyword: "${keyword}"` : ""}

${youtubeContext}

${context}

Study the top-performing titles above carefully — their exact word order, structure, emotional triggers, use of numbers, and power words. Your titles must be modelled on what is ACTUALLY getting clicks in this niche right now, not generic YouTube advice.

For each title, explain specifically which pattern from the top videos it borrows from.

Return ONLY valid JSON:
{
  "titles": [
    {
      "title": "The exact title",
      "type": "Curiosity | How-To | List | Story | Controversy | Benefit | Challenge",
      "score": 92,
      "reasoning": "Which top video pattern this borrows from and why it will perform",
      "keyword": "the keyword naturally included"
    }
  ],
  "tips": [
    "Specific insight from the top videos in this niche about what makes titles click",
    "Another niche-specific tip",
    "A third actionable tip"
  ]
}

Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      maxTokens: 1500,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data, youtubeIntel: intel ? { avgViews: intel.avgViews, topTitles: intel.topTitles.slice(0, 5), videoCount: intel.topVideos.length } : null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 });
  }
}
