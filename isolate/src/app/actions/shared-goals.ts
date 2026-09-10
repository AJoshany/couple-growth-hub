"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sharedGoalSchema, sharedMilestoneSchema } from "@/lib/validations/shared-goal";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id, coupleId: session.user.coupleId };
}

// ── Shared Goal CRUD ────────────────────────────────

export async function createSharedGoal(formData: FormData) {
  const { userId, coupleId } = await requireAuth();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    category: formData.get("category") as string,
    startDate: (formData.get("startDate") as string) || undefined,
    targetDate: (formData.get("targetDate") as string) || undefined,
  };

  const parsed = sharedGoalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const goal = await prisma.sharedGoal.create({
    data: {
      coupleId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : new Date(),
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
    },
  });

  await prisma.timelineEvent.create({
    data: {
      coupleId,
      userId,
      type: "SHARED_GOAL_CREATED",
      title: `Created shared goal: ${goal.title}`,
    },
  });

  redirect(`/shared-goals/${goal.id}`);
}

export async function updateSharedGoal(goalId: string, formData: FormData) {
  const { userId, coupleId } = await requireAuth();

  const goal = await prisma.sharedGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.coupleId !== coupleId) return { error: "Not found" };

  const raw = {
    title: (formData.get("title") as string) || goal.title,
    description: (formData.get("description") as string) || undefined,
    category: (formData.get("category") as string) || goal.category,
    status: (formData.get("status") as string) || undefined,
    progress: formData.get("progress") !== null ? Number(formData.get("progress")) : undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    targetDate: (formData.get("targetDate") as string) || undefined,
  };

  const parsed = sharedGoalSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const oldStatus = goal.status;
  const newStatus = parsed.data.status;

  await prisma.sharedGoal.update({
    where: { id: goalId },
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
    },
  });

  if (oldStatus !== "COMPLETED" && newStatus === "COMPLETED") {
    await prisma.timelineEvent.create({
      data: {
        coupleId,
        userId,
        type: "SHARED_GOAL_COMPLETED",
        title: `Completed shared goal: ${goal.title}`,
      },
    });
  }

  return { success: true };
}

export async function deleteSharedGoal(goalId: string) {
  const { coupleId } = await requireAuth();

  const goal = await prisma.sharedGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.coupleId !== coupleId) return { error: "Not found" };

  await prisma.sharedGoal.delete({ where: { id: goalId } });
  redirect("/shared-goals");
}

export async function updateSharedGoalProgress(goalId: string, data: { progress: number; status?: string }) {
  const { userId, coupleId } = await requireAuth();

  const goal = await prisma.sharedGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.coupleId !== coupleId) return { error: "Not found" };

  const oldStatus = goal.status;
  const newStatus = data.status || (data.progress === 100 ? "COMPLETED" : goal.status);

  await prisma.sharedGoal.update({
    where: { id: goalId },
    data: {
      progress: data.progress,
      status: newStatus as any,
    },
  });

  if (oldStatus !== "COMPLETED" && newStatus === "COMPLETED") {
    await prisma.timelineEvent.create({
      data: {
        coupleId,
        userId,
        type: "SHARED_GOAL_COMPLETED",
        title: `Completed shared goal: ${goal.title}`,
      },
    });
  }

  return { success: true };
}

// ── Shared Milestones ───────────────────────────────

export async function addSharedMilestone(goalId: string, formData: FormData) {
  const { coupleId } = await requireAuth();

  const goal = await prisma.sharedGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.coupleId !== coupleId) return { error: "Not found" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = sharedMilestoneSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.sharedGoalMilestone.create({
    data: {
      sharedGoalId: goalId,
      title: parsed.data.title,
      description: parsed.data.description,
    },
  });

  return { success: true };
}

export async function toggleSharedMilestone(milestoneId: string) {
  const { userId, coupleId } = await requireAuth();

  const milestone = await prisma.sharedGoalMilestone.findUnique({
    where: { id: milestoneId },
    include: { sharedGoal: { select: { coupleId: true, title: true } } },
  });

  if (!milestone || milestone.sharedGoal.coupleId !== coupleId) return { error: "Not found" };

  const newCompleted = !milestone.isCompleted;

  await prisma.sharedGoalMilestone.update({
    where: { id: milestoneId },
    data: {
      isCompleted: newCompleted,
      completedAt: newCompleted ? new Date() : null,
    },
  });

  if (newCompleted) {
    await prisma.timelineEvent.create({
      data: {
        coupleId,
        userId,
        type: "SHARED_MILESTONE_COMPLETED",
        title: `Shared milestone completed: ${milestone.title} (${milestone.sharedGoal.title})`,
      },
    });
  }

  return { success: true };
}

export async function deleteSharedMilestone(milestoneId: string) {
  const { coupleId } = await requireAuth();

  const milestone = await prisma.sharedGoalMilestone.findUnique({
    where: { id: milestoneId },
    include: { sharedGoal: { select: { coupleId: true } } },
  });

  if (!milestone || milestone.sharedGoal.coupleId !== coupleId) return { error: "Not found" };

  await prisma.sharedGoalMilestone.delete({ where: { id: milestoneId } });
  return { success: true };
}

// ── Queries ─────────────────────────────────────────

export async function getSharedGoals() {
  const { coupleId } = await requireAuth();

  const goals = await prisma.sharedGoal.findMany({
    where: { coupleId },
    include: { milestones: true },
    orderBy: { createdAt: "desc" },
  });

  return goals;
}

export async function getSharedGoal(goalId: string) {
  const { coupleId } = await requireAuth();

  const goal = await prisma.sharedGoal.findUnique({
    where: { id: goalId },
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!goal || goal.coupleId !== coupleId) return null;
  return goal;
}
