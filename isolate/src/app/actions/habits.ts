"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id };
}

export async function createHabit(name: string, icon?: string, color?: string) {
  const { userId } = await requireAuth();

  if (!name.trim()) {
    return { error: "Habit name cannot be empty" };
  }

  const habit = await prisma.habit.create({
    data: {
      userId,
      name: name.trim(),
      icon: icon || "✅",
      color: color || "#10b981",
    },
  });

  return { success: true, habit };
}

export async function getHabits() {
  const { userId } = await requireAuth();

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      entries: {
        orderBy: { date: "desc" },
        take: 30, // Last 30 days
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return habits;
}

export async function toggleHabitEntry(habitId: string, date: Date) {
  const { userId } = await requireAuth();

  // Verify ownership
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { userId: true },
  });

  if (!habit || habit.userId !== userId) {
    return { error: "Not found" };
  }

  // Normalize date to start of day
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Find existing entry
  const existingEntry = await prisma.habitEntry.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: normalizedDate,
      },
    },
  });

  if (existingEntry) {
    // Toggle completion
    await prisma.habitEntry.update({
      where: { id: existingEntry.id },
      data: { completed: !existingEntry.completed },
    });
  } else {
    // Create new entry
    await prisma.habitEntry.create({
      data: {
        habitId,
        date: normalizedDate,
        completed: true,
      },
    });
  }

  return { success: true };
}

export async function deleteHabit(habitId: string) {
  const { userId } = await requireAuth();

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { userId: true },
  });

  if (!habit || habit.userId !== userId) {
    return { error: "Not found" };
  }

  await prisma.habit.delete({
    where: { id: habitId },
  });

  return { success: true };
}

export async function getHabitStats(habitId: string) {
  const { userId } = await requireAuth();

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      entries: {
        where: { completed: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!habit || habit.userId !== userId) {
    return null;
  }

  const entries = habit.entries;

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    const hasEntry = entries.some(
      (e) => new Date(e.date).toDateString() === checkDate.toDateString()
    );

    if (hasEntry) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 365; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    const hasEntry = entries.some(
      (e) => new Date(e.date).toDateString() === checkDate.toDateString()
    );

    if (hasEntry) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate completion rate (last 30 days)
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const recentEntries = entries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo
  );

  const completionRate = Math.round((recentEntries.length / 30) * 100);

  return {
    currentStreak,
    longestStreak,
    totalCompletions: entries.length,
    completionRate,
  };
}
