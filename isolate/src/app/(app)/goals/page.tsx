import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GoalsListClient } from "./goals-list-client";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { milestones: { select: { isCompleted: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <GoalsListClient goals={goals} />;
}
