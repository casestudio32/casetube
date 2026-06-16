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
    const intel = await getNicheIntelligence(title, title);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    const prompt = `You are a YouTube SEO specialist writing a description for the video: "${title}"
${keywords ? `Creator-supplied keywords to weave in naturally: ${keywords}` : ""}

REAL YOUTUBE DATA FOR "${title}":
${youtubeContext}

Creator context: ${context}

---
KEYWORD OPTIMIZATION RULES (follow all of these strictly):

RULE 1 — FRONT-LOAD THE PRIMARY KEYWORD
The first 1-2 sentences are the most critical. YouTube reads them heavily for context and they appear in search results before "Show more". The primary keyword from the title MUST appear naturally in the very first sentence.

RULE 2 — ONE PRIMARY KEYWORD
The primary keyword is the exact topic of this video: "${title}". Mention it 2-4 times naturally across the description. Do not repeat it more than that.

RULE 3 — SEMANTIC KEYWORDS ONLY
Include related terms that genuinely belong to the topic of "${title}". Study the top video titles above — what specific sub-topics, techniques, tools, and concepts do they reference? Use those. Do NOT include popular but unrelated keywords just because they have high search volume.

RULE 4 — NEVER KEYWORD STUFF
Never list keywords. Never repeat phrases unnaturally. Every keyword must appear inside a meaningful, readable sentence. Write for humans first.

RULE 5 — MATCH SEARCH INTENT EXACTLY
Ask: what would someone type into YouTube to find THIS exact video? The description must answer that precisely. If this is a tutorial, describe exactly what the viewer will learn to do. If it's a review, describe exactly what is being reviewed.

RULE 6 — STAY ON TOPIC
ONLY include words, concepts, and references that are directly about "${title}". Do not mention unrelated topics, other YouTube channels, or popular terms that have nothing to do with this video.

RULE 7 — LONG-TAIL PHRASING
Where possible, use specific long-tail phrases (e.g. "how to create smooth stickman animation for beginners") rather than broad single words (e.g. "animation").

---
STRUCTURE (follow this exactly):

Section 1 — Search Snippet (first 2 sentences, shown before "Show more"):
• Primary keyword in sentence 1
• What the viewer will learn/get from watching

Section 2 — Expanded Summary (2-3 sentences):
• Add semantic keywords from the real YouTube data above
• Describe the specific content, techniques, or steps covered
• Stay tightly on the topic of "${title}"

Section 3 — Timestamps (realistic for this video topic)

Section 4 — Links placeholder

Section 5 — Subscribe line (mention the specific niche/topic, not a generic "content")

Section 6 — 2-3 hashtags only (directly relevant to "${title}", no generic ones)

---
Return ONLY valid JSON. description must be a single string with \\n for line breaks:
{
  "description": "...",
  "tags": ["tag1",...] (15 tags, all directly about "${title}" — pulled from real keywords above),
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"] (exactly 3, topic-specific only)
}

Return ONLY the JSON object.`;

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 3000,
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
