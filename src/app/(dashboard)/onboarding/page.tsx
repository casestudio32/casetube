import { OnboardingFlow } from "./onboarding-flow";
import { auth } from "@/lib/auth/edge-config";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <OnboardingFlow userName={session.user.name ?? "Creator"} userId={session.user.id ?? ""} />;
}
