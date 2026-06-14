import { NextResponse } from "next/server";
import { generateAI } from "@/lib/ai/provider";
import { db } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const { title, keywords, userId } = await req.json();

    const memory = userId
      ? await db.creatorMemory.findUnique({ where: { userId } })
      : null;

    const context = memory
      ? `Channel niche: ${memory.niche}. Brand voice: ${memory.brandVoice}.`
      : "";

    const prompt = `You are a YouTube SEO specialist. Write a fully optimized YouTube video description for:

Video title: "${title}"
${keywords ? `Keywords to include: ${keywords}` : ""}
${context}

Return ONLY valid JSON with this structure. IMPORTANT: The description value must be a single string with \\n for line breaks — do NOT use actual newlines inside the JSON string value:
{
  "description": "First compelling sentence about the video.\\n\\nSecond paragraph with more detail and keywords.\\n\\n⏱ TIMESTAMPS\\n0:00 Introduction\\n2:00 Main content\\n\\n🔗 LINKS\\n[Your links here]\\n\\n✅ Subscribe for more videos like this!",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13", "tag14", "tag15"],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
}

Rules:
- description: single JSON string, use \\n for line breaks, include keywords naturally, 300-400 words
- tags: array of exactly 15 tag strings
- hashtags: array of exactly 5 hashtag strings starting with #
- Return ONLY the JSON object, nothing else`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Strip markdown code fences if present
    let raw = response.content.trim();
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    // Extract JSON object
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", raw.slice(0, 300));
      throw new Error("AI returned unexpected format");
    }

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "\nRaw:", jsonMatch[0].slice(0, 300));
      throw new Error("Failed to parse AI response");
    }

    // Ensure arrays exist
    if (!Array.isArray(data.tags)) data.tags = [];
    if (!Array.isArray(data.hashtags)) data.hashtags = [];
    if (typeof data.description !== "string") data.description = "";

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Description route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
