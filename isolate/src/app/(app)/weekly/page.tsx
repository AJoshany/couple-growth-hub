import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WeeklyReviewClient } from "./weekly-review-client";
import { WeeklyDigest } from "@/components/weekly-digest";

export default async function WeeklyPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  return (
    <div className="space-y-6">
      <WeeklyDigest />
      <WeeklyReviewClient />
    </div>
  );
}
