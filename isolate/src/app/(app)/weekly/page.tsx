import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WeeklyReviewClient } from "./weekly-review-client";

export default async function WeeklyPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  return <WeeklyReviewClient />;
}
