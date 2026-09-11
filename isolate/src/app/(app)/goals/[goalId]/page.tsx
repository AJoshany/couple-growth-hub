import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GoalDetailClient } from "./goal-detail-client";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!goal || goal.userId !== session.user.id) notFound();

  return <GoalDetailClient goal={goal} />;
}
