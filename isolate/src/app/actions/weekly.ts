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

function getWeekRange(offset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek + 1 + offset * 7); // Monday
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function getWeeklyReview(weekOffset = 0) {
  const { userId, coupleId } = await requireAuth();
  const { start, end } = getWeekRange(weekOffset);

  // Journal entries for the week
  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  });

  // Individual goals progress
  const goals = await prisma.goal.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    select: {
      id: true,
      title: true,
      progress: true,
      status: true,
      category: true,
    },
  });

  // Shared goals progress
  const sharedGoals = await prisma.sharedGoal.findMany({
    where: { coupleId, status: { not: "CANCELLED" } },
    select: {
      id: true,
      title: true,
      progress: true,
      status: true,
      category: true,
    },
  });

  // Activities completed this week
  const activities = await prisma.dailyActivity.findMany({
    where: {
      dailyLog: { userId, date: { gte: start, lte: end } },
    },
    select: { id: true, isCompleted: true },
  });

  // Dates this week
  const dates = await prisma.dateEvent.findMany({
    where: { coupleId, date: { gte: start, lte: end } },
    select: { id: true, title: true, isCompleted: true },
  });

  // Memories this week
  const memories = await prisma.memory.count({
    where: { coupleId, date: { gte: start, lte: end } },
  });

  // Missing entries this week
  const missingEntries = await prisma.missingEntry.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    select: { date: true, value: true },
    orderBy: { date: "asc" },
  });

  // Partner missing entries
  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  let partnerMissing: { date: Date; value: number }[] = [];
  if (partner) {
    partnerMissing = await prisma.missingEntry.findMany({
      where: { userId: partner.id, date: { gte: start, lte: end } },
      select: { date: true, value: true },
      orderBy: { date: "asc" },
    });
  }

  // Calculate averages
  const avgMood =
    journalEntries.length > 0
      ? journalEntries.reduce((s, e) => s + (e.mood || 0), 0) / journalEntries.length
      : 0;
  const avgEnergy =
    journalEntries.length > 0
      ? journalEntries.reduce((s, e) => s + (e.energy || 0), 0) / journalEntries.length
      : 0;
  const avgProductivity =
    journalEntries.length > 0
      ? journalEntries.reduce((s, e) => s + (e.productivity || 0), 0) / journalEntries.length
      : 0;

  const journalCompletion = Math.round((journalEntries.length / 7) * 100);
  const activityCompletion =
    activities.length > 0
      ? Math.round(
          (activities.filter((a) => a.isCompleted).length / activities.length) * 100
        )
      : 0;

  return {
    weekStart: start,
    weekEnd: end,
    journal: {
      entries: journalEntries.length,
      completion: journalCompletion,
      avgMood: Math.round(avgMood * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgProductivity: Math.round(avgProductivity * 10) / 10,
      dailyData: journalEntries.map((e) => ({
        day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
        mood: e.mood || 0,
        energy: e.energy || 0,
        productivity: e.productivity || 0,
      })),
    },
    goals: {
      individual: goals,
      shared: sharedGoals,
    },
    activities: {
      total: activities.length,
      completed: activities.filter((a) => a.isCompleted).length,
      completion: activityCompletion,
    },
    dates: {
      count: dates.length,
      items: dates,
    },
    memories,
    missing: {
      mine: missingEntries,
      partner: partnerMissing,
    },
  };
}
