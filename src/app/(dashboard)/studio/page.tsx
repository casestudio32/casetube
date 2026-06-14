import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { StudioClient } from "./studio-client";

export default async function StudioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <StudioClient userId={session.user.id} />;
}
