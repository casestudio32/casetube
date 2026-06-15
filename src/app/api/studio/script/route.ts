import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { title, keyPoints, duration, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory
      ? `Brand voice: ${memory.brandVoice}. Audience: ${memory.targetAudience}. Niche: ${memory.niche}.`
      : "";

    const intel = await getNicheIntelligence(title, title);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a professional YouTube scriptwriter. Write a complete, engaging video script.

Video title: "${title}"
${keyPoints ? `Key points to cover: ${keyPoints}` : ""}
Target duration: ${duration || "8-10"} minutes
${context}

${youtubeContext}

Study the top-performing videos in this niche above. Your script must be informed by what makes those videos successful — their pacing, structure, the way they hold attention, the language they use. This script should feel like it belongs in the same tier as those top videos.

Return ONLY valid JSON:
{
  "script": {
    "hook": "The opening 30-second hook script (spoken word, exactly what to say)",
    "intro": "30-second intro after hook — establish credibility and preview what viewer will learn",
    "sections": [
      {
        "title": "Section title",
        "timestamp": "0:45",
        "script": "Full word-for-word script for this section. Use [B-ROLL: description] for visual cues. Use [PAUSE] for emphasis. Make it conversational and engaging.",
        "patternInterrupt": "What to do here to re-engage viewers (e.g. ask a question, show example, change visual)"
      }
    ],
    "cta": "The mid-video call to action (subscribe, like, comment prompt)",
    "outro": "The closing 30-60 seconds — recap, final thought, subscribe ask, next video tease",
    "chapters": ["0:00 Introduction", "0:45 Section title"],
    "totalWordCount": 1200,
    "speakingNotes": "3-4 delivery tips specific to this script and niche"
  }
}

Write 4-6 sections. Make the script conversational, not robotic. Include specific examples and stories. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      maxTokens: 4000,
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
