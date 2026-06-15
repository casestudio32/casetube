import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { TrendsClient } from "./trends-client";

export default async function TrendsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <TrendsClient userId={session.user.id} />;
}
