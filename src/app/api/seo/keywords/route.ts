import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Creator niche: ${memory.niche}. Target audience: ${memory.targetAudience}.` : "";

    // Fetch real YouTube data for this topic
    const nicheQuery = memory?.niche ? `${topic} ${memory.niche}` : topic;
    const intel = await getNicheIntelligence(nicheQuery, topic);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube SEO expert. Analyse the topic "${topic}" and generate a comprehensive keyword research report backed by real YouTube data.

${youtubeContext}

${context}

Using the real YouTube data above — the actual titles, views, and patterns from top-performing videos — generate a keyword report that reflects what people are genuinely searching for and clicking on right now.

Return ONLY valid JSON:
{
  "primaryKeyword": "the best main keyword based on what top videos are ranking for",
  "searchVolume": "estimated monthly searches based on niche activity",
  "competition": "Low | Medium | High",
  "opportunityScore": 85,
  "keywords": [
    { "keyword": "exact keyword phrase from niche data", "intent": "Informational | Commercial | Navigational", "difficulty": "Easy | Medium | Hard", "opportunity": "High | Medium | Low" }
  ],
  "longTail": [
    { "keyword": "long tail keyword opportunity", "why": "why this specific keyword is a good gap in this niche" }
  ],
  "questions": [
    "Question people search related to this topic?"
  ],
  "contentAngles": [
    { "angle": "Specific content angle title that could beat the top videos", "hook": "why this angle would outperform existing content" }
  ],
  "searchIntent": "What viewers actually want when searching this topic based on the top performing content",
  "competitorTip": "One specific insight from the top performing videos on how to outrank them"
}

Generate 8 keywords, 6 long-tail keywords, 5 questions, 4 content angles. Base everything on the real YouTube data provided. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data, youtubeIntel: intel ? { avgViews: intel.avgViews, topTitles: intel.topTitles.slice(0, 5), videoCount: intel.topVideos.length } : null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to research keywords" }, { status: 500 });
  }
}
