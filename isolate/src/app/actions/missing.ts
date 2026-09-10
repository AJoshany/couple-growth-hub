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

export async function logMissingEntry(value: number) {
  const { userId } = await requireAuth();

  if (value < 0 || value > 100) return { error: "Value must be between 0 and 100" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.missingEntry.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, value },
    update: { value },
  });

  return { success: true };
}

export async function getMissingStatus() {
  const { userId, coupleId } = await requireAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // My latest entry
  const myEntry = await prisma.missingEntry.findFirst({
    where: { userId, date: { gte: today } },
    orderBy: { date: "desc" },
  });

  // Partner's latest entry
  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  let partnerEntry = null;
  if (partner) {
    partnerEntry = await prisma.missingEntry.findFirst({
      where: { userId: partner.id, date: { gte: today } },
      orderBy: { date: "desc" },
    });
  }

  return {
    myValue: myEntry?.value ?? null,
    myDate: myEntry?.date ?? null,
    partnerValue: partnerEntry?.value ?? null,
    partnerDate: partnerEntry?.date ?? null,
  };
}

export async function getMissingTrend(days = 30) {
  const { userId, coupleId } = await requireAuth();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const myEntries = await prisma.missingEntry.findMany({
    where: { userId, date: { gte: since } },
    select: { date: true, value: true },
    orderBy: { date: "asc" },
  });

  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  let partnerEntries: { date: Date; value: number }[] = [];
  if (partner) {
    partnerEntries = await prisma.missingEntry.findMany({
      where: { userId: partner.id, date: { gte: since } },
      select: { date: true, value: true },
      orderBy: { date: "asc" },
    });
  }

  return { mine: myEntries, partner: partnerEntries };
}
