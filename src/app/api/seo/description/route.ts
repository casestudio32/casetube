import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { title, keywords, userId } = await req.json();

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Channel niche: ${memory.niche}. Brand voice: ${memory.brandVoice}. Target audience: ${memory.targetAudience}.` : "";

    // Fetch real YouTube data
    const intel = await getNicheIntelligence(memory?.niche || title, title);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube SEO specialist. Write a fully optimised description for: "${title}"
${keywords ? `Keywords to include: ${keywords}` : ""}

${youtubeContext}

${context}

The first 2 lines of the description are critical — they show before "Show more" and determine whether viewers click through. Study what top videos in this niche use and write a description that matches that level of quality.

Use the real keywords from the top videos above. Make the tags and hashtags match what's actually performing in this niche.

Return ONLY valid JSON. IMPORTANT: description must be a single string with \\n for line breaks:
{
  "description": "First compelling line that hooks immediately.\\n\\nSecond paragraph — value proposition and what viewers will learn. Include primary keyword naturally.\\n\\n⏱ TIMESTAMPS\\n0:00 Introduction\\n2:00 Main section\\n\\n🔗 LINKS\\n[Your website]\\n[Social media]\\n\\n✅ Subscribe for more [niche] content!\\n\\n${keywords ? keywords.split(",").slice(0, 3).join(" | ") : ""}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13", "tag14", "tag15"],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
}

Rules: description is a single JSON string with \\n for line breaks, 300-400 words, tags array of exactly 15 strings, hashtags array of exactly 5 strings starting with #. Tags must reflect real keywords from the niche data above. Return ONLY the JSON object.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });

    let raw = response.content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned unexpected format");

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response");
    }

    if (!Array.isArray(data.tags)) data.tags = [];
    if (!Array.isArray(data.hashtags)) data.hashtags = [];
    if (typeof data.description !== "string") data.description = "";

    return NextResponse.json({ data, youtubeIntel: intel ? { avgViews: intel.avgViews, topTitles: intel.topTitles.slice(0, 3), videoCount: intel.topVideos.length } : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
