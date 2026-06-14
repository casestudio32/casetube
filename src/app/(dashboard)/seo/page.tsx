import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { SEOClient } from "./seo-client";

export default async function SEOPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <SEOClient userId={session.user.id} />;
}
