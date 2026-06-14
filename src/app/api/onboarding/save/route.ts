import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  country: z.string().optional(),
  experience: z.string().optional(),
  channelUrl: z.string().optional(),
  channelDesc: z.string().optional(),
  goals: z.array(z.string()).optional(),
  availableHours: z.number().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  brandType: z.string().optional(),
  editingAbility: z.string().optional(),
  budget: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await db.creatorProfile.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        country: data.country,
        experience: data.experience,
        channelUrl: data.channelUrl,
        channelDesc: data.channelDesc,
        goals: data.goals ?? [],
        availableHours: data.availableHours,
        skills: data.skills ?? [],
        interests: data.interests ?? [],
        brandType: data.brandType,
        editingAbility: data.editingAbility,
        budget: data.budget,
        onboardingDone: true,
      },
      update: {
        country: data.country,
        experience: data.experience,
        channelUrl: data.channelUrl,
        channelDesc: data.channelDesc,
        goals: data.goals ?? [],
        availableHours: data.availableHours,
        skills: data.skills ?? [],
        interests: data.interests ?? [],
        brandType: data.brandType,
        editingAbility: data.editingAbility,
        budget: data.budget,
        onboardingDone: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
