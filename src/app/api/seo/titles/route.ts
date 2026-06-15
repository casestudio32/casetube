import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { topic, keyword, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Brand voice: ${memory.brandVoice}. Audience: ${memory.targetAudience}.` : "";

    const intel = await getNicheIntelligence(topic, topic);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube title expert. Generate 8 optimised titles for a video about: "${topic}"
${keyword ? `Target keyword: "${keyword}"` : ""}

REAL YOUTUBE DATA FOR "${topic}":
${youtubeContext}

Creator context: ${context}

The titles above are ACTUALLY ranking and getting views on YouTube right now for this topic. Study them closely:
- What word patterns appear repeatedly?
- How do they use numbers, brackets, or power words?
- What emotional triggers are they using?
- How specific vs. broad are they?

Now write 8 titles for "${topic}" that apply those exact patterns. Each title must be unmistakably about "${topic}" — not a generic YouTube title that could apply to anything.

Return ONLY valid JSON:
{
  "titles": [
    {
      "title": "The exact title — specific to ${topic}",
      "type": "Curiosity | How-To | List | Story | Controversy | Benefit | Challenge",
      "score": 92,
      "reasoning": "Which specific pattern from the top videos this borrows and why it will perform",
      "keyword": "the keyword naturally included"
    }
  ],
  "tips": [
    "Specific pattern observed in the top ${topic} titles that you applied",
    "Second specific insight from the real data",
    "Third actionable tip based on what's actually working"
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
