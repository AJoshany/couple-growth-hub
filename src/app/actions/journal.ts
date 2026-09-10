"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { journalEntrySchema, activitySchema } from "@/lib/validations/journal";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id, coupleId: session.user.coupleId };
}

// ── Journal Entry CRUD ──────────────────────────────

export async function upsertJournalEntry(formData: FormData) {
  const { userId } = await requireAuth();

  const raw = {
    date: formData.get("date") as string,
    summary: (formData.get("summary") as string) || undefined,
    accomplishments: (formData.get("accomplishments") as string) || undefined,
    learned: (formData.get("learned") as string) || undefined,
    difficult: (formData.get("difficult") as string) || undefined,
    tomorrow: (formData.get("tomorrow") as string) || undefined,
    mood: formData.get("mood") ? Number(formData.get("mood")) : undefined,
    energy: formData.get("energy") ? Number(formData.get("energy")) : undefined,
    productivity: formData.get("productivity") ? Number(formData.get("productivity")) : undefined,
    visibility: (formData.get("visibility") as string) || undefined,
  };

  const parsed = journalEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const dateStr = parsed.data.date;
  const date = new Date(dateStr + "T00:00:00");

  const entry = await prisma.journalEntry.upsert({
    where: { userId_date: { userId, date } },
    create: {
      userId,
      date,
      summary: parsed.data.summary,
      accomplishments: parsed.data.accomplishments,
      learned: parsed.data.learned,
      difficult: parsed.data.difficult,
      tomorrow: parsed.data.tomorrow,
      mood: parsed.data.mood,
      energy: parsed.data.energy,
      productivity: parsed.data.productivity,
      visibility: parsed.data.visibility as any || "PARTNER_VISIBLE",
    },
    update: {
      summary: parsed.data.summary,
      accomplishments: parsed.data.accomplishments,
      learned: parsed.data.learned,
      difficult: parsed.data.difficult,
      tomorrow: parsed.data.tomorrow,
      mood: parsed.data.mood,
      energy: parsed.data.energy,
      productivity: parsed.data.productivity,
      visibility: parsed.data.visibility as any || undefined,
    },
  });

  // Create timeline event
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coupleId: true },
  });
  if (user?.coupleId) {
    await prisma.timelineEvent.create({
      data: {
        coupleId: user.coupleId,
        userId,
        type: "JOURNAL_ENTRY",
        title: `Journal entry for ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      },
    });
  }

  return { success: true, entryId: entry.id };
}

export async function getJournalEntry(date: string) {
  const { userId } = await requireAuth();
  const d = new Date(date + "T00:00:00");

  const entry = await prisma.journalEntry.findUnique({
    where: { userId_date: { userId, date: d } },
    include: {
      user: { select: { name: true } },
    },
  });

  return entry;
}

export async function getJournalEntries(limit = 30) {
  const { userId } = await requireAuth();

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });

  return entries;
}

export async function deleteJournalEntry(date: string) {
  const { userId } = await requireAuth();
  const d = new Date(date + "T00:00:00");

  await prisma.journalEntry.deleteMany({
    where: { userId, date: d },
  });

  return { success: true };
}

// ── Daily Activities ────────────────────────────────

export async function getOrCreateDailyLog(date: string) {
  const { userId } = await requireAuth();
  const d = new Date(date + "T00:00:00");

  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: d } },
    create: { userId, date: d },
    update: {},
    include: {
      activities: { orderBy: { createdAt: "asc" } },
    },
  });

  return log;
}

export async function addActivity(dailyLogId: string, formData: FormData) {
  const { userId } = await requireAuth();

  // Verify ownership
  const log = await prisma.dailyLog.findUnique({
    where: { id: dailyLogId },
    select: { userId: true },
  });
  if (!log || log.userId !== userId) return { error: "Not found" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    goalId: (formData.get("goalId") as string) || undefined,
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.dailyActivity.create({
    data: {
      dailyLogId,
      title: parsed.data.title,
      description: parsed.data.description,
      goalId: parsed.data.goalId || null,
    },
  });

  return { success: true };
}

export async function toggleActivity(activityId: string) {
  const { userId } = await requireAuth();

  const activity = await prisma.dailyActivity.findUnique({
    where: { id: activityId },
    include: { dailyLog: { select: { userId: true } } },
  });

  if (!activity || activity.dailyLog.userId !== userId) return { error: "Not found" };

  await prisma.dailyActivity.update({
    where: { id: activityId },
    data: { isCompleted: !activity.isCompleted },
  });

  return { success: true };
}

export async function deleteActivity(activityId: string) {
  const { userId } = await requireAuth();

  const activity = await prisma.dailyActivity.findUnique({
    where: { id: activityId },
    include: { dailyLog: { select: { userId: true } } },
  });

  if (!activity || activity.dailyLog.userId !== userId) return { error: "Not found" };

  await prisma.dailyActivity.delete({ where: { id: activityId } });
  return { success: true };
}
