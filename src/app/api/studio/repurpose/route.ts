import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { title, summary, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Brand voice: ${memory.brandVoice}. Niche: ${memory.niche}.` : "";

    const intel = await getNicheIntelligence(memory?.niche || title, title);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a content repurposing expert. Take this YouTube video and repurpose it across platforms.

Video title: "${title}"
${summary ? `Summary: ${summary}` : ""}
${context}

${youtubeContext}

Use the real niche data above to inform the language, hooks, and keywords used across all repurposed content. The shorts hooks and social posts should reference what's working in this niche.

Return ONLY valid JSON:
{
  "shorts": [
    {
      "title": "YouTube Shorts title",
      "concept": "What this short covers (the one key idea)",
      "hook": "The first line of the short (must hook in 1 second)",
      "script": "30-60 second short script"
    }
  ],
  "xPosts": [
    {
      "post": "The full X/Twitter post (under 280 chars)",
      "type": "Thread starter | Single tweet | Quote | Stat"
    }
  ],
  "linkedIn": {
    "post": "Full LinkedIn post (300-500 words). Professional tone. Include line breaks. End with a question to drive comments.",
    "hook": "The opening line"
  },
  "communityPost": "YouTube community post to promote this video (casual, engaging, 100-150 words)",
  "emailSubject": "Email newsletter subject line for this video",
  "emailPreview": "Email preview text (90 chars)"
}

Generate 3 Shorts ideas and 4 X posts. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      maxTokens: 2500,
    });

    let raw = response.content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data, youtubeIntel: intel ? { avgViews: intel.avgViews, topTitles: intel.topTitles.slice(0, 3), videoCount: intel.topVideos.length } : null });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
