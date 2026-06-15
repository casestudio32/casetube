import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory
      ? `Creator niche: ${memory.niche}. Target audience: ${memory.targetAudience}. Content pillars: ${memory.contentPillars?.join(", ")}.`
      : "";

    const searchQuery = topic || memory?.niche || "youtube content creation";
    const intel = await getNicheIntelligence(searchQuery, searchQuery);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube content strategist. A creator wants video ideas about: "${searchQuery}".

REAL YOUTUBE DATA FOR "${searchQuery}":
${youtubeContext}

Creator context: ${context}

The videos above are ACTUALLY performing on YouTube right now for "${searchQuery}". These are real titles with real view counts. Your job is to study what's working and generate ideas that are:
1. Directly about "${searchQuery}" — not loosely related topics
2. Modelled on the title structures, formats, and angles of the top performers above
3. Offering a fresh angle that doesn't duplicate what already exists

Do NOT generate generic YouTube advice ideas. Every idea must be something a viewer searching "${searchQuery}" would immediately want to click.

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "Specific, clickable title directly about ${searchQuery} — modelled on top performers",
      "hook": "The exact opening line for this video (word for word, specific to the topic)",
      "angle": "What makes this different from the videos already ranking — based on the gaps you see in the data",
      "format": "Tutorial | List | Story | Case Study | Reaction | Interview | Challenge",
      "estimatedLength": "8-12 mins",
      "difficulty": "Easy | Medium | Hard",
      "potential": "High | Medium | Low",
      "whyItWorks": "Specific reason based on the real YouTube data above — reference actual patterns you observed"
    }
  ]
}

Generate 10 ideas. Every idea must be specifically about "${searchQuery}". Return only JSON.`;

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
