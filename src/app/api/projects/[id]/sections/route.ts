import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { generateAI } from "@/lib/ai/provider";
import { getNicheIntelligence, formatNicheContext } from "@/lib/youtube/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const { type, userId } = await req.json();

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const creatorContext = memory
      ? `Creator niche: ${memory.niche}. Brand voice: ${memory.brandVoice}. Target audience: ${memory.targetAudience}. Content pillars: ${memory.contentPillars?.join(", ")}.`
      : "";

    const title = project.title;
    const topic = project.videoTopic || title;

    // Fetch real YouTube data for this niche/topic
    const nicheQuery = memory?.niche ? `${topic} ${memory.niche}` : topic;
    const intel = await getNicheIntelligence(nicheQuery, topic);
    const youtubeContext = intel ? formatNicheContext(intel) : "";

    let prompt = "";

    if (type === "IDEAS") {
      prompt = `You are a YouTube strategist who studies what actually works on the platform. Generate 5 specific video ideas for a creator in the "${memory?.niche || topic}" niche.

${youtubeContext}

Creator context: ${creatorContext}
Video topic area: "${topic}"

Based on the real YouTube data above, generate 5 video ideas that follow the patterns of what's already getting millions of views in this niche. Each idea should have a fresh angle that doesn't copy but improves on what's working.

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "Specific, clickable YouTube title (study the top titles above for structure)",
      "angle": "The unique angle that makes this better than existing videos",
      "targetAudience": "Who specifically will click this",
      "estimatedViews": "Realistic view estimate based on niche average of ${intel?.avgViews?.toLocaleString() || "unknown"}"
    }
  ]
}`;

    } else if (type === "HOOK") {
      prompt = `You are a YouTube retention expert. Write 5 opening hooks for a video titled: "${title}".

${youtubeContext}

Creator context: ${creatorContext}

Study how the top-performing videos in this niche open — they create immediate tension, curiosity or bold claims. Write hooks that match the energy and directness of content getting 500K+ views in this space.

Return ONLY valid JSON:
{
  "hooks": [
    {
      "hook": "The exact opening lines — 2-4 sentences, word for word what the creator says",
      "type": "Bold Claim | Question | Story | Shocking Stat | Controversy | Promise",
      "psychology": "The psychological trigger being used and why it works for THIS niche audience",
      "bestFor": "What format or audience segment this hook works best for"
    }
  ]
}

Rules: Never start with "Hey guys" or "Welcome back". Start mid-action or with a bold statement. Be specific to this topic, not generic.`;

    } else if (type === "TITLE") {
      prompt = `You are a YouTube title expert. Generate 10 optimised titles for a video about: "${topic}" in the ${memory?.niche || "YouTube"} niche.

${youtubeContext}

Creator context: ${creatorContext}

Study the title structures of the top-performing videos above carefully. Notice: the word order, the use of numbers, the emotional triggers, the power words. Your titles must follow what ACTUALLY gets clicks in this niche — not generic YouTube advice.

Return ONLY valid JSON:
{
  "titles": [
    {
      "title": "The full YouTube title",
      "type": "How-To | Listicle | Story | Controversy | Challenge | Tutorial | Review",
      "charCount": 0,
      "score": 85,
      "whyItWorks": "One sentence on why this title pattern works in this niche based on the data"
    }
  ],
  "keywords": ["keyword1", "keyword2"]
}`;

    } else if (type === "SEO_PACKAGE") {
      prompt = `You are a YouTube SEO expert. Create a complete SEO package for: "${title}" in the ${memory?.niche || "YouTube"} niche.

${youtubeContext}

Creator context: ${creatorContext}

Use the real keyword data from the top-performing videos above. The primary keyword and tags should match what people are actually searching for to find videos like the top ones listed.

Return ONLY valid JSON:
{
  "primaryKeyword": "The exact search term with highest volume for this topic",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12"],
  "searchIntent": "What the viewer is trying to achieve when they search this",
  "seoScore": 87,
  "suggestions": ["Specific optimisation tip 1", "Specific tip 2", "Specific tip 3"]
}`;

    } else if (type === "SCRIPT") {
      prompt = `You are a professional YouTube scriptwriter. Write a complete, engaging script for: "${title}".

${youtubeContext}

Creator context: ${creatorContext}

Study what keeps viewers watching in the top videos of this niche. Write a script that matches the energy, pacing and depth of content getting 500K+ views — conversational, specific, story-driven. No filler, no padding.

Return ONLY valid JSON:
{
  "script": {
    "hook": "Opening 30 seconds — exact words. Must create immediate tension or curiosity based on what works in this niche.",
    "intro": "30-second intro after hook — establish credibility, preview what viewer learns",
    "sections": [
      {
        "title": "Section title",
        "timestamp": "0:45",
        "script": "Full word-for-word script. Use [B-ROLL: description] for visuals. Use [PAUSE] for emphasis. Conversational, specific, story-driven.",
        "patternInterrupt": "What to do here to re-engage viewers"
      }
    ],
    "cta": "Mid-video call to action",
    "outro": "Closing 30-60 seconds — recap, subscribe ask, next video tease",
    "chapters": ["0:00 Introduction", "0:45 Section"],
    "totalWordCount": 1200,
    "speakingNotes": "3-4 delivery tips specific to this niche audience"
  }
}

Write 4-6 sections. Return only JSON.`;

    } else if (type === "DESCRIPTION") {
      prompt = `You are a YouTube description writer. Write a description for: "${title}" in the ${memory?.niche || "YouTube"} niche.

${youtubeContext}

Creator context: ${creatorContext}

Model the description structure on what top channels in this niche use. The first 2 lines must be strong (shown before "show more"). Include real keywords from the niche data above.

Return ONLY valid JSON:
{
  "description": {
    "full": "Complete description — first 2 lines hook the reader, then value, then links/timestamps, then hashtags",
    "short": "Under 150 chars for short-form use",
    "timestamps": ["0:00 Introduction", "0:45 Section"],
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
    "cta": "The main call to action line"
  },
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
}`;

    } else if (type === "THUMBNAIL") {
      prompt = `You are a YouTube thumbnail strategist. Generate 3 thumbnail concepts for: "${title}" in the ${memory?.niche || "YouTube"} niche.

${youtubeContext}

Study the thumbnail patterns of top-performing videos in this niche. What emotions do they trigger? What visual style works? Generate concepts that follow proven patterns but stand out.

Return ONLY valid JSON:
{
  "concepts": [
    {
      "concept": "Concept name and one-line description",
      "textOverlay": "Exact text on thumbnail (max 4 words, high impact)",
      "visualElements": "What to show: faces, objects, backgrounds, composition",
      "colorScheme": "Specific colours and why they work for this niche",
      "emotion": "The exact emotion this thumbnail triggers in the viewer"
    }
  ]
}`;

    } else if (type === "SHORTS") {
      prompt = `You are a YouTube Shorts expert. Create 3 Shorts from the main video: "${title}".

${youtubeContext}

Creator context: ${creatorContext}

Shorts that perform in this niche are fast, specific, and end on a strong hook or reveal. Each Short should be a standalone piece of value clipped from the main video concept.

Return ONLY valid JSON:
{
  "shorts": [
    {
      "title": "Shorts title with #Shorts",
      "concept": "The one key insight or moment this Short covers",
      "hook": "First line — must hook in under 2 seconds",
      "script": "30-60 second script, fast-paced, no filler"
    }
  ]
}`;

    } else if (type === "COMMUNITY_POST") {
      prompt = `You are a YouTube community manager. Write a community post promoting: "${title}" in the ${memory?.niche || "YouTube"} niche.

Creator context: ${creatorContext}

The post must feel personal and conversational, not promotional. Ask a question that gets comments. Match the tone of a creator who genuinely connects with their audience.

Return ONLY valid JSON:
{
  "communityPost": "The full community post — casual, engaging, 100-150 words, ends with a question",
  "pollOptions": ["Option 1", "Option 2", "Option 3"],
  "bestPostTime": "When to post this for maximum engagement"
}`;

    } else {
      return NextResponse.json({ error: "Unknown section type" }, { status: 400 });
    }

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      maxTokens: 4000,
    });

    let raw = response.content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = JSON.parse(jsonMatch[0]) as any;

    // Store YouTube intelligence alongside content
    if (intel) {
      content._youtubeIntel = {
        avgViews: intel.avgViews,
        topTitles: intel.topTitles.slice(0, 5),
        commonKeywords: intel.commonKeywords.slice(0, 8),
        videoCount: intel.topVideos.length,
      };
    }

    const existing = await db.projectSection.findFirst({ where: { projectId, type } });
    let section;
    if (existing) {
      section = await db.projectSection.update({
        where: { id: existing.id },
        data: { content, version: existing.version + 1 },
      });
    } else {
      section = await db.projectSection.create({ data: { projectId, type, content } });
    }

    return NextResponse.json({ section, youtubeIntel: intel ? { avgViews: intel.avgViews, topTitles: intel.topTitles.slice(0, 5), videoCount: intel.topVideos.length } : null });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
