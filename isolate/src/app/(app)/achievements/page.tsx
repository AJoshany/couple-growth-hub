import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AchievementsPageClient } from "./achievements-page-client";

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const userId = session.user.id;
  const coupleId = session.user.coupleId;

  // Calculate user stats
  const [
    goalsCompleted,
    milestonesCompleted,
    journalEntries,
    habitsTracked,
    datesCompleted,
    memoriesAdded,
    loveNotesSent,
    couple,
  ] = await Promise.all([
    prisma.goal.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.goalMilestone.count({
      where: { goal: { userId }, isCompleted: true },
    }),
    prisma.journalEntry.count({
      where: { userId },
    }),
    prisma.habit.count({
      where: { userId },
    }),
    prisma.dateEvent.count({
      where: { coupleId: coupleId || "", isCompleted: true },
    }),
    prisma.memory.count({
      where: { coupleId: coupleId || "" },
    }),
    prisma.loveNote.count({
      where: { coupleId: coupleId || "", senderId: userId },
    }),
    coupleId
      ? prisma.couple.findUnique({
          where: { id: coupleId },
          select: { startDate: true },
        })
      : null,
  ]);

  // Calculate days together
  const daysTogether = couple?.startDate
    ? Math.floor(
        (Date.now() - new Date(couple.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Calculate journal streak (simplified - count consecutive days with entries)
  const journalEntriesData = await prisma.journalEntry.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
    take: 100,
  });

  let journalStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    const hasEntry = journalEntriesData.some(
      (e) => new Date(e.date).toDateString() === checkDate.toDateString()
    );

    if (hasEntry) {
      journalStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Calculate habit streak (simplified)
  const habitsData = await prisma.habit.findMany({
    where: { userId },
    include: {
      entries: {
        where: { completed: true },
        select: { date: true },
        orderBy: { date: "desc" },
        take: 100,
      },
    },
  });

  let habitStreak = 0;
  if (habitsData.length > 0) {
    // Find the longest streak across all habits
    for (const habit of habitsData) {
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);

        const hasEntry = habit.entries.some(
          (e) => new Date(e.date).toDateString() === checkDate.toDateString()
        );

        if (hasEntry) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      habitStreak = Math.max(habitStreak, streak);
    }
  }

  const stats = {
    goalsCompleted,
    milestonesCompleted,
    journalEntries,
    journalStreak,
    habitsTracked,
    habitStreak,
    datesCompleted,
    memoriesAdded,
    loveNotesSent,
    daysTogether,
  };

  return <AchievementsPageClient stats={stats} />;
}
