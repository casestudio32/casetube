import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <AnalyticsClient userId={session.user.id} />;
}
