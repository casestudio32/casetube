import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { FeedClient } from "./feed-client";

export const metadata = { title: "Feed — CaseTube" };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const accessToken = (session.user as { accessToken?: string }).accessToken;
  return <FeedClient userId={session.user.id} accessToken={accessToken} />;
}
