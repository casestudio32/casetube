import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { generateAI } from "@/lib/ai/provider";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const profile = await db.creatorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const systemPrompt = `You are an expert YouTube growth strategist with 10+ years of experience helping creators grow from zero to monetization. You specialize in niche selection, content strategy, brand positioning, and sustainable YouTube growth. Your advice is specific, actionable, and tailored to each creator's unique situation. Never give generic advice.`;

    const userPrompt = `Analyze this creator's profile and generate a comprehensive Creator Blueprint:

CREATOR PROFILE:
- Country: ${profile.country || "Not specified"}
- Experience Level: ${profile.experience === "existing" ? "Existing Creator" : "Complete Beginner"}
- Channel Description: ${profile.channelDesc || "Not provided"}
- Channel URL: ${profile.channelUrl || "Not provided"}
- Goals: ${profile.goals.join(", ") || "Not specified"}
- Available Time: ${profile.availableHours || 5} hours per week
- Skills: ${profile.skills.join(", ") || "Not specified"}
- Interests: ${profile.interests.join(", ") || "Not specified"}
- Brand Type: ${profile.brandType || "Not specified"}
- Editing Ability: ${profile.editingAbility || "None"}
- Budget: ${profile.budget || "Zero"}

Generate a detailed Creator Blueprint in valid JSON format with this exact structure:
{
  "niche": "A specific, focused niche recommendation with clear reasoning (2-3 sentences)",
  "targetAudience": "Detailed description of the ideal viewer - age, situation, pain points, desires (2-3 sentences)",
  "contentPillars": ["Pillar 1 - with brief description", "Pillar 2", "Pillar 3", "Pillar 4"],
  "brandVoice": "The tone, style, and personality of the channel (2-3 sentences)",
  "videoFormats": ["Format 1 with description", "Format 2", "Format 3"],
  "postingSchedule": "Specific posting frequency and best days/times recommendation with reasoning",
  "growthRoadmap": "A 90-day step-by-step roadmap broken into 3 phases of 30 days each",
  "monetization": "Specific monetization strategy aligned with their niche and goals, including timeline",
  "weaknesses": "Honest assessment of potential challenges and how to overcome them",
  "advantages": "Unique advantages and strengths this creator has that others don't"
}

Be specific to their country (${profile.country}), interests (${profile.interests.join(", ")}), and goals. Return only valid JSON.`;

    const response = await generateAI({
      messages: [{ role: "user", content: userPrompt }],
      systemPrompt,
      temperature: 0.8,
      maxTokens: 3000,
    });

    // Parse the AI response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }
    const blueprintData = JSON.parse(jsonMatch[0]);

    // Save to database
    const blueprint = await db.creatorBlueprint.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        niche: blueprintData.niche,
        targetAudience: blueprintData.targetAudience,
        contentPillars: blueprintData.contentPillars,
        brandVoice: blueprintData.brandVoice,
        videoFormats: blueprintData.videoFormats,
        postingSchedule: blueprintData.postingSchedule,
        growthRoadmap: blueprintData.growthRoadmap,
        monetization: blueprintData.monetization,
        weaknesses: blueprintData.weaknesses,
        advantages: blueprintData.advantages,
        rawJson: blueprintData,
      },
      update: {
        niche: blueprintData.niche,
        targetAudience: blueprintData.targetAudience,
        contentPillars: blueprintData.contentPillars,
        brandVoice: blueprintData.brandVoice,
        videoFormats: blueprintData.videoFormats,
        postingSchedule: blueprintData.postingSchedule,
        growthRoadmap: blueprintData.growthRoadmap,
        monetization: blueprintData.monetization,
        weaknesses: blueprintData.weaknesses,
        advantages: blueprintData.advantages,
        rawJson: blueprintData,
      },
    });

    // Also save key details to creator memory
    await db.creatorMemory.upsert({
      where: { userId },
      create: {
        userId,
        niche: blueprintData.niche,
        brandVoice: blueprintData.brandVoice,
        targetAudience: blueprintData.targetAudience,
        contentPillars: blueprintData.contentPillars,
        goals: profile.goals,
      },
      update: {
        niche: blueprintData.niche,
        brandVoice: blueprintData.brandVoice,
        targetAudience: blueprintData.targetAudience,
        contentPillars: blueprintData.contentPillars,
        goals: profile.goals,
      },
    });

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json({ error: "Failed to generate blueprint" }, { status: 500 });
  }
}
