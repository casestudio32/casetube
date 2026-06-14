import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const projects = await db.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { sections: true } } },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
