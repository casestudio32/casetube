import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [profile, projects] = await Promise.all([
    db.creatorProfile.findUnique({
      where: { userId: session.user.id },
      include: { blueprint: true },
    }),
    db.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <DashboardClient
      userName={session.user.name ?? "Creator"}
      profile={profile}
      blueprint={profile?.blueprint ?? null}
      recentProjects={projects}
    />
  );
}
