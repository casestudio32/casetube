import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory
      ? `Niche: ${memory.niche}. Audience: ${memory.targetAudience}. Content pillars: ${memory.contentPillars?.join(", ")}.`
      : "";

    const nicheQuery = topic || memory?.niche || "youtube content";
    const intel = await getNicheIntelligence(nicheQuery, topic || memory?.niche || "");
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube content strategist. Generate 10 high-performing video ideas${topic ? ` about "${topic}"` : " based on the creator's niche"}.

${youtubeContext}

${context}

Study the real top-performing videos above. Your ideas must be directly inspired by what is ACTUALLY getting views in this niche right now — not generic content advice. Look at the titles, view counts, and patterns in the data above and generate ideas that could compete with or outperform those specific videos.

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "Compelling video title (modelled on patterns from top performers)",
      "hook": "The opening line that grabs attention in the first 5 seconds",
      "angle": "The unique angle that makes this different from the top videos already out there",
      "format": "Tutorial | List | Story | Case Study | Reaction | Interview | Challenge",
      "estimatedLength": "8-12 mins",
      "difficulty": "Easy | Medium | Hard",
      "potential": "High | Medium | Low",
      "whyItWorks": "Specific reason based on what the top videos in this niche are doing"
    }
  ]
}

Make ideas specific. Vary the formats. Base everything on the real YouTube data above. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      maxTokens: 2500,
    });

    let raw = response.content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data, youtubeIntel: intel ? { avgViews: intel.avgViews, topTitles: intel.topTitles.slice(0, 5), videoCount: intel.topVideos.length } : null });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
