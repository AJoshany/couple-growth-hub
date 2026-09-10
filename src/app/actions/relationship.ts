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

export async function getRelationshipInfo() {
  const { userId, coupleId } = await requireAuth();

  const couple = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: {
      users: { select: { id: true, name: true } },
    },
  });

  if (!couple) return null;

  const partner = couple.users.find((u) => u.id !== userId);
  const daysTogether = couple.startDate
    ? Math.floor(
        (Date.now() - new Date(couple.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Last date
  const lastDate = await prisma.dateEvent.findFirst({
    where: { coupleId, isCompleted: true },
    orderBy: { date: "desc" },
  });

  // Next date
  const nextDate = await prisma.dateEvent.findFirst({
    where: { coupleId, isCompleted: false, date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  // Total dates together
  const totalDates = await prisma.dateEvent.count({
    where: { coupleId, isCompleted: true },
  });

  // Total memories
  const totalMemories = await prisma.memory.count({
    where: { coupleId },
  });

  return {
    couple: {
      id: couple.id,
      name: couple.name,
      startDate: couple.startDate,
    },
    partner: partner ? { id: partner.id, name: partner.name } : null,
    daysTogether,
    lastDate: lastDate
      ? { id: lastDate.id, title: lastDate.title, date: lastDate.date }
      : null,
    nextDate: nextDate
      ? { id: nextDate.id, title: nextDate.title, date: nextDate.date, location: nextDate.location }
      : null,
    totalDates,
    totalMemories,
  };
}

export async function updateRelationshipInfo(data: {
  name?: string;
  startDate?: string;
}) {
  const { coupleId } = await requireAuth();

  await prisma.couple.update({
    where: { id: coupleId },
    data: {
      name: data.name,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
    },
  });

  return { success: true };
}
