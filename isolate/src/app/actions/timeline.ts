"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id, coupleId: session.user.coupleId };
}

export async function getTimelineEvents(limit = 50) {
  const { coupleId } = await requireAuth();

  const events = await prisma.timelineEvent.findMany({
    where: { coupleId },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
  });

  return events;
}
