import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoveNotesPageClient } from "./love-notes-page-client";

export default async function LoveNotesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  return <LoveNotesPageClient />;
}
