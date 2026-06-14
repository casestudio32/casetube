import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const { userId, title, description, videoTopic } = await req.json();
    if (!userId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await db.project.create({
      data: { userId, title, description, videoTopic, stage: "RESEARCH", status: "ACTIVE" },
    });

    return NextResponse.json({ project });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
