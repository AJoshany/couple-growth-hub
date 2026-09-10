import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SharedGoalDetailClient } from "./shared-goal-detail-client";

export default async function SharedGoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const goal = await prisma.sharedGoal.findUnique({
    where: { id: goalId },
    include: { milestones: { orderBy: { createdAt: "asc" } } },
  });

  if (!goal || goal.coupleId !== session.user.coupleId) notFound();

  return <SharedGoalDetailClient goal={goal} />;
}
