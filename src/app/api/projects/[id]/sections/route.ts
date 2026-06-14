import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { generateAI } from "@/lib/ai/provider";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const { type, userId } = await req.json();

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const memory = userId ? await db.creatorMemory.findUnique({ where: { userId } }) : null;
    const context = memory ? `Brand voice: ${memory.brandVoice}. Audience: ${memory.targetAudience}. Niche: ${memory.niche}.` : "";

    const title = project.title;
    const topic = project.videoTopic || title;

    let prompt = "";
    let content: Record<string, unknown> = {};

    if (type === "IDEAS") {
      prompt = `Generate 5 YouTube video ideas related to: "${topic}". ${context}
Return ONLY valid JSON: { "ideas": [{ "title": "...", "angle": "...", "targetAudience": "...", "estimatedViews": "..." }] }`;
    } else if (type === "HOOK") {
      prompt = `Write 5 powerful YouTube hooks for a video titled: "${title}". ${context}
Return ONLY valid JSON: { "hooks": [{ "hook": "...", "type": "...", "psychology": "...", "bestFor": "..." }] }`;
    } else if (type === "TITLE") {
      prompt = `Generate 10 optimized YouTube titles for a video about: "${topic}". ${context}
Return ONLY valid JSON: { "titles": [{ "title": "...", "type": "...", "charCount": 0, "score": 0 }], "keywords": [] }`;
    } else if (type === "SCRIPT") {
      prompt = `Write a full YouTube video script for: "${title}". ${context}
Return ONLY valid JSON: { "script": { "hook": "...", "intro": "...", "sections": [{ "title": "...", "timestamp": "...", "script": "...", "patternInterrupt": "..." }], "cta": "...", "outro": "...", "chapters": [], "totalWordCount": 0, "speakingNotes": "..." } }`;
    } else if (type === "DESCRIPTION") {
      prompt = `Write a YouTube description for a video titled: "${title}". ${context}
Return ONLY valid JSON: { "description": { "full": "...", "short": "...", "timestamps": [], "hashtags": [], "cta": "..." }, "tags": [] }`;
    } else if (type === "THUMBNAIL") {
      prompt = `Generate 3 YouTube thumbnail concepts for: "${title}". ${context}
Return ONLY valid JSON: { "concepts": [{ "concept": "...", "textOverlay": "...", "visualElements": "...", "colorScheme": "...", "emotion": "..." }] }`;
    } else if (type === "SHORTS") {
      prompt = `Create 3 YouTube Shorts ideas from a video titled: "${title}". ${context}
Return ONLY valid JSON: { "shorts": [{ "title": "...", "concept": "...", "hook": "...", "script": "..." }] }`;
    } else if (type === "COMMUNITY_POST") {
      prompt = `Write a YouTube community post to promote a video titled: "${title}". ${context}
Return ONLY valid JSON: { "communityPost": "...", "pollOptions": [], "bestPostTime": "..." }`;
    } else if (type === "SEO_PACKAGE") {
      prompt = `Create a complete SEO package for a YouTube video titled: "${title}". Topic: "${topic}". ${context}
Return ONLY valid JSON: { "primaryKeyword": "...", "secondaryKeywords": [], "tags": [], "searchIntent": "...", "seoScore": 0, "suggestions": [] }`;
    } else {
      return NextResponse.json({ error: "Unknown section type" }, { status: 400 });
    }

    const response = await generateAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      maxTokens: 3000,
    });

    let raw = response.content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    content = JSON.parse(jsonMatch[0]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonContent = content as any;

    // Upsert section (replace if same type already exists)
    const existing = await db.projectSection.findFirst({ where: { projectId, type } });
    let section;
    if (existing) {
      section = await db.projectSection.update({
        where: { id: existing.id },
        data: { content: jsonContent, version: existing.version + 1 },
      });
    } else {
      section = await db.projectSection.create({ data: { projectId, type, content: jsonContent } });
    }

    return NextResponse.json({ section });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
