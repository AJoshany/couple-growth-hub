import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReadingPageClient } from "./reading-page-client";

export default async function ReadingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  return <ReadingPageClient />;
}
