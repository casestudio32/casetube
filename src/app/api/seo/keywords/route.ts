import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

    // Load creator memory for personalization
    const memory = userId
      ? await db.creatorMemory.findUnique({ where: { userId } })
      : null;

    const context = memory
      ? `Creator niche: ${memory.niche}. Target audience: ${memory.targetAudience}.`
      : "";

    const prompt = `You are a YouTube SEO expert. Analyze the topic "${topic}" and generate a comprehensive keyword research report.

${context}

Return ONLY valid JSON in this exact format:
{
  "primaryKeyword": "the best main keyword for this topic",
  "searchVolume": "estimated monthly searches (e.g. 10K-50K)",
  "competition": "Low | Medium | High",
  "opportunityScore": 85,
  "keywords": [
    { "keyword": "exact keyword phrase", "intent": "Informational | Commercial | Navigational", "difficulty": "Easy | Medium | Hard", "opportunity": "High | Medium | Low" }
  ],
  "longTail": [
    { "keyword": "long tail keyword", "why": "one sentence on why this is a good opportunity" }
  ],
  "questions": [
    "Question people search on this topic?",
    "Another common question?"
  ],
  "contentAngles": [
    { "angle": "unique content angle title", "hook": "why this angle would perform well" }
  ],
  "searchIntent": "2-3 sentences describing what people actually want when they search this topic",
  "competitorTip": "One specific tip on how to outrank existing videos on this topic"
}

Generate 8 keywords, 6 long-tail keywords, 5 questions, and 4 content angles. Be specific and actionable. Return only JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to research keywords" }, { status: 500 });
  }
}
