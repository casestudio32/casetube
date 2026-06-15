import { NextResponse } from "next/server";
import { getNicheIntelligence } from "@/lib/youtube/client";
import { db } from "@/lib/db/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const topic = searchParams.get("topic") || undefined;

    let niche = searchParams.get("niche");
    if (!niche && userId) {
      const memory = await db.creatorMemory.findUnique({ where: { userId } });
      niche = memory?.niche || null;
    }

    if (!niche) return NextResponse.json({ error: "No niche provided" }, { status: 400 });

    const intel = await getNicheIntelligence(niche, topic || undefined);
    if (!intel) return NextResponse.json({ error: "Could not fetch YouTube data" }, { status: 500 });

    return NextResponse.json({ intel });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
