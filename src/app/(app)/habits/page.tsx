import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HabitsPageClient } from "./habits-page-client";

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  return <HabitsPageClient />;
}
