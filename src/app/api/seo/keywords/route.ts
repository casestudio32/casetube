import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";
import { getNicheIntelligence, formatNicheContext, getYouTubeSuggestions, getSearchVideoCount } from "@/lib/youtube/client";

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Creator niche: ${memory.niche}. Target audience: ${memory.targetAudience}.` : "";

    // Parallel: AI context + YouTube Suggest (free) + video count (real competition signal)
    const [intel, suggestions, videoCount] = await Promise.all([
      getNicheIntelligence(topic, topic),
      getYouTubeSuggestions(topic),
      getSearchVideoCount(topic),
    ]);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube SEO expert. A creator wants to rank for: "${topic}".

REAL YOUTUBE DATA FOR "${topic}":
${youtubeContext}

Creator context: ${context}

The data above shows ACTUAL videos currently ranking on YouTube for this topic — their real titles, real view counts, and real keywords. Use this data as your source of truth.

Your job: Extract what's working and find the gaps. What keywords appear in the top titles? What questions are viewers searching? Where is there low competition but high demand?

Return ONLY valid JSON:
{
  "primaryKeyword": "the exact search phrase most top videos are optimising for",
  "searchVolume": "estimated monthly searches based on niche activity level",
  "competition": "Low | Medium | High",
  "opportunityScore": 85,
  "keywords": [
    { "keyword": "keyword pulled directly from top video titles/topics", "intent": "Informational | Commercial | Navigational", "difficulty": "Easy | Medium | Hard", "opportunity": "High | Medium | Low" }
  ],
  "longTail": [
    { "keyword": "specific long-tail phrase a viewer would type", "why": "why this is a gap or opportunity based on the real data" }
  ],
  "questions": [
    "Question people actually search when looking for this topic"
  ],
  "contentAngles": [
    { "angle": "Specific title that could outperform existing top videos", "hook": "What makes this angle better than what currently ranks" }
  ],
  "searchIntent": "What viewers actually want when they search this — based on the top performing content above",
  "competitorTip": "One specific, actionable insight from studying the top videos above"
}

Generate 20 keywords, 15 long-tail, 12 questions, 6 angles. Every item must be grounded in the real YouTube data above — no generic advice. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 4000,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      data,
      suggestions,
      videoCount,
      youtubeIntel: intel ? { avgViews: intel.avgViews, topTitles: intel.topTitles.slice(0, 5), videoCount: intel.topVideos.length } : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to research keywords" }, { status: 500 });
  }
}
