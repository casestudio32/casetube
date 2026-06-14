import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <ProjectsClient userId={session.user.id} />;
}
