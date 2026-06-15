import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Brand voice: ${memory.brandVoice}. Audience: ${memory.targetAudience}. Niche: ${memory.niche}.` : "";

    const nicheQuery = memory?.niche ? `${topic} ${memory.niche}` : topic;
    const intel = await getNicheIntelligence(nicheQuery, topic);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube hook specialist. The first 30 seconds of a video determine everything. Write 6 powerful hooks for a video about: "${topic}"

${youtubeContext}

${context}

Study how the top-performing videos in this niche open their content. Your hooks must reflect the energy, language, and emotional triggers that are ACTUALLY working in this niche right now — not generic hook formulas.

Return ONLY valid JSON:
{
  "hooks": [
    {
      "hook": "The exact opening lines (2-4 sentences)",
      "type": "Bold Claim | Question | Story | Shocking Stat | Controversy | Promise",
      "psychology": "The psychological trigger this hook uses",
      "bestFor": "What type of audience or video format this works best for",
      "inspiredBy": "Which pattern from the top videos in this niche this borrows from"
    }
  ]
}

Each hook must:
- Start mid-action or with a bold statement
- Create immediate curiosity or tension
- Never start with "Hey guys" or "Welcome back"
- Be specific to the topic and niche
Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      maxTokens: 1500,
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
