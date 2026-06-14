import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";
import { ProjectClient } from "./project-client";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  return <ProjectClient projectId={id} userId={session.user.id} />;
}
