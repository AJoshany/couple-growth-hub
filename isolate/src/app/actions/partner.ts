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

export async function getPartnerProfile() {
  const { userId, coupleId } = await requireAuth();

  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true, name: true, email: true },
  });

  return partner;
}

export async function getPartnerGoals() {
  const { userId, coupleId } = await requireAuth();

  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  if (!partner) return [];

  const goals = await prisma.goal.findMany({
    where: { userId: partner.id, status: { not: "CANCELLED" } },
    include: { milestones: { select: { id: true, title: true, isCompleted: true } } },
    orderBy: { createdAt: "desc" },
  });

  return goals;
}

export async function getPartnerJournalEntries() {
  const { userId, coupleId } = await requireAuth();

  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  if (!partner) return [];

  // Only return entries that are partner-visible
  const entries = await prisma.journalEntry.findMany({
    where: { userId: partner.id, visibility: "PARTNER_VISIBLE" },
    orderBy: { date: "desc" },
    take: 14,
  });

  return entries;
}

export async function getPartnerMoodTrend() {
  const { userId, coupleId } = await requireAuth();

  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  if (!partner) return [];

  // Only partner-visible entries for mood trend
  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: partner.id,
      visibility: "PARTNER_VISIBLE",
      mood: { not: null },
    },
    select: { date: true, mood: true, energy: true, productivity: true },
    orderBy: { date: "desc" },
    take: 30,
  });

  return entries;
}

export async function getPartnerRecentActivities() {
  const { userId, coupleId } = await requireAuth();

  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  if (!partner) return [];

  const activities = await prisma.dailyActivity.findMany({
    where: {
      dailyLog: { userId: partner.id },
    },
    include: {
      dailyLog: { select: { date: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return activities;
}

export async function getPartnerCompletedMilestones() {
  const { userId, coupleId } = await requireAuth();

  const partner = await prisma.user.findFirst({
    where: { coupleId, id: { not: userId } },
    select: { id: true },
  });

  if (!partner) return [];

  const milestones = await prisma.goalMilestone.findMany({
    where: {
      isCompleted: true,
      goal: { userId: partner.id },
    },
    include: { goal: { select: { title: true } } },
    orderBy: { completedAt: "desc" },
    take: 10,
  });

  return milestones;
}
