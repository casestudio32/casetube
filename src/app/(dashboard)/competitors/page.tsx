import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { CompetitorsClient } from "./competitors-client";

export default async function CompetitorsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <CompetitorsClient />;
}
