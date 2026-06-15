import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { MyChannelClient } from "./my-channel-client";

export default async function MyChannelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const hasOAuth = !!(session.user as { accessToken?: string }).accessToken;
  return <MyChannelClient hasOAuth={hasOAuth} />;
}
