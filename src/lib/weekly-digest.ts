import { prisma } from "@/lib/prisma";

export interface WeeklyDigestData {
  weekStart: Date;
  weekEnd: Date;
  summary: {
    journalEntries: number;
    goalsProgress: number;
    datesCompleted: number;
    memoriesAdded: number;
    habitsCompleted: number;
    loveNotesExchanged: number;
  };
  highlights: string[];
  partnerActivity: {
    journalEntries: number;
    goalsProgress: number;
  };
  moodTrend: {
    average: number;
    trend: "improving" | "declining" | "stable";
  };
}

export async function generateWeeklyDigest(userId: string): Promise<WeeklyDigestData> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday
  weekEnd.setHours(23, 59, 59, 999);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coupleId: true },
  });

  const coupleId = user?.coupleId;

  // Get journal entries for the week
  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
  });

  // Get goals progress
  const goals = await prisma.goal.findMany({
    where: { userId },
    select: { progress: true, status: true },
  });

  const totalGoalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
  const avgGoalProgress = goals.length > 0 ? Math.round(totalGoalProgress / goals.length) : 0;

  // Get dates completed
  const datesCompleted = coupleId
    ? await prisma.dateEvent.count({
        where: {
          coupleId,
          isCompleted: true,
          date: { gte: weekStart, lte: weekEnd },
        },
      })
    : 0;

  // Get memories added
  const memoriesAdded = coupleId
    ? await prisma.memory.count({
        where: {
          coupleId,
          createdAt: { gte: weekStart, lte: weekEnd },
        },
      })
    : 0;

  // Get habits completed
  const habitsCompleted = await prisma.habitEntry.count({
    where: {
      habit: { userId },
      completed: true,
      date: { gte: weekStart, lte: weekEnd },
    },
  });

  // Get love notes exchanged
  const loveNotesExchanged = coupleId
    ? await prisma.loveNote.count({
        where: {
          coupleId,
          createdAt: { gte: weekStart, lte: weekEnd },
        },
      })
    : 0;

  // Calculate mood trend
  const moodEntries = journalEntries.filter((e) => e.mood !== null);
  const avgMood =
    moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + (e.mood || 0), 0) / moodEntries.length
      : 0;

  // Get previous week's mood for comparison
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekStart);
  prevWeekEnd.setDate(weekStart.getDate() - 1);

  const prevWeekEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      date: { gte: prevWeekStart, lte: prevWeekEnd },
      mood: { not: null },
    },
    select: { mood: true },
  });

  const prevAvgMood =
    prevWeekEntries.length > 0
      ? prevWeekEntries.reduce((sum, e) => sum + (e.mood || 0), 0) /
        prevWeekEntries.length
      : avgMood;

  let moodTrend: "improving" | "declining" | "stable" = "stable";
  if (avgMood > prevAvgMood + 0.3) moodTrend = "improving";
  else if (avgMood < prevAvgMood - 0.3) moodTrend = "declining";

  // Generate highlights
  const highlights: string[] = [];
  if (journalEntries.length >= 5) {
    highlights.push("🎯 Excellent journaling consistency!");
  }
  if (datesCompleted > 0) {
    highlights.push(`💕 Had ${datesCompleted} date(s) this week!`);
  }
  if (memoriesAdded > 0) {
    highlights.push(`📸 Created ${memoriesAdded} new memories!`);
  }
  if (habitsCompleted >= 7) {
    highlights.push("🔥 Completed all habits this week!");
  }
  if (loveNotesExchanged >= 5) {
    highlights.push(`💌 Sent ${loveNotesExchanged} love notes!`);
  }
  if (moodTrend === "improving") {
    highlights.push("📈 Mood is trending upward!");
  }

  // Get partner activity if in a couple
  let partnerActivity = { journalEntries: 0, goalsProgress: 0 };
  if (coupleId) {
    const partner = await prisma.user.findFirst({
      where: { coupleId, id: { not: userId } },
      select: { id: true },
    });

    if (partner) {
      const partnerJournals = await prisma.journalEntry.count({
        where: {
          userId: partner.id,
          date: { gte: weekStart, lte: weekEnd },
        },
      });

      const partnerGoals = await prisma.goal.findMany({
        where: { userId: partner.id },
        select: { progress: true },
      });

      const partnerProgress =
        partnerGoals.length > 0
          ? Math.round(
              partnerGoals.reduce((sum, g) => sum + g.progress, 0) /
                partnerGoals.length
            )
          : 0;

      partnerActivity = {
        journalEntries: partnerJournals,
        goalsProgress: partnerProgress,
      };
    }
  }

  return {
    weekStart,
    weekEnd,
    summary: {
      journalEntries: journalEntries.length,
      goalsProgress: avgGoalProgress,
      datesCompleted,
      memoriesAdded,
      habitsCompleted,
      loveNotesExchanged,
    },
    highlights,
    partnerActivity,
    moodTrend: {
      average: Math.round(avgMood * 10) / 10,
      trend: moodTrend,
    },
  };
}

export function formatDigestAsText(digest: WeeklyDigestData): string {
  const weekStartStr = digest.weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const weekEndStr = digest.weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  let text = `📅 Weekly Digest (${weekStartStr} - ${weekEndStr})\n\n`;

  text += `📊 Summary:\n`;
  text += `• Journal Entries: ${digest.summary.journalEntries}\n`;
  text += `• Goals Progress: ${digest.summary.goalsProgress}%\n`;
  text += `• Dates Completed: ${digest.summary.datesCompleted}\n`;
  text += `• Memories Added: ${digest.summary.memoriesAdded}\n`;
  text += `• Habits Completed: ${digest.summary.habitsCompleted}\n`;
  text += `• Love Notes: ${digest.summary.loveNotesExchanged}\n\n`;

  if (digest.highlights.length > 0) {
    text += `✨ Highlights:\n`;
    digest.highlights.forEach((h) => {
      text += `${h}\n`;
    });
    text += `\n`;
  }

  text += `😊 Mood Trend: ${digest.moodTrend.average}/5 (${digest.moodTrend.trend})\n`;

  return text;
}
