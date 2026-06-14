import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const [projects, sections, memory] = await Promise.all([
      db.project.findMany({
        where: { userId },
        include: { _count: { select: { sections: true } } },
        orderBy: { createdAt: "asc" },
      }),
      db.projectSection.findMany({
        where: { project: { userId } },
        select: { type: true, createdAt: true, version: true },
      }),
      db.creatorMemory.findUnique({ where: { userId } }),
    ]);

    // Stage distribution
    const stageCount: Record<string, number> = {};
    projects.forEach(p => {
      stageCount[p.stage] = (stageCount[p.stage] || 0) + 1;
    });

    // Section type distribution
    const sectionTypeCount: Record<string, number> = {};
    sections.forEach(s => {
      sectionTypeCount[s.type] = (sectionTypeCount[s.type] || 0) + 1;
    });

    // Projects created over time (last 8 weeks)
    const now = new Date();
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = projects.filter(p => {
        const d = new Date(p.createdAt);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeks.push({ label, count });
    }

    // Published projects
    const published = projects.filter(p => p.stage === "PUBLISHING" || p.stage === "ANALYSIS" || p.status === "PUBLISHED").length;

    // Total regenerations (version > 1)
    const regens = sections.filter(s => s.version > 1).reduce((acc, s) => acc + s.version - 1, 0);

    return NextResponse.json({
      stats: {
        totalProjects: projects.length,
        totalSections: sections.length,
        published,
        regens,
        avgSectionsPerProject: projects.length > 0 ? Math.round(sections.length / projects.length) : 0,
        niche: memory?.niche || null,
      },
      stageCount,
      sectionTypeCount,
      projectsOverTime: weeks,
      recentProjects: projects.slice(-5).reverse().map(p => ({
        id: p.id,
        title: p.title,
        stage: p.stage,
        sections: p._count.sections,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
