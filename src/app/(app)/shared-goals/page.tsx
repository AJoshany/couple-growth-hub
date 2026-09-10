import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SharedGoalsListClient } from "./shared-goals-list-client";

export default async function SharedGoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const goals = await prisma.sharedGoal.findMany({
    where: { coupleId: session.user.coupleId },
    include: { milestones: { select: { isCompleted: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <SharedGoalsListClient goals={goals} />;
}
