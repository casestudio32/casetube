import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { BlueprintClient } from "./blueprint-client";

export default async function BlueprintPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: { blueprint: true },
  });

  if (!profile) redirect("/onboarding");

  return (
    <BlueprintClient
      userId={session.user.id}
      userName={session.user.name ?? "Creator"}
      existingBlueprint={profile.blueprint}
    />
  );
}
