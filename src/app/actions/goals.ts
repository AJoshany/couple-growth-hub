"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { goalSchema, milestoneSchema, updateProgressSchema } from "@/lib/validations/goal";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  // Goals are personal, so they only require a signed-in user. The couple is
  // optional and is only used to mirror activity onto the shared timeline.
  return { userId: session.user.id, coupleId: session.user.coupleId };
}

// ── Goal CRUD ───────────────────────────────────────

export async function createGoal(formData: FormData) {
  const { userId } = await requireAuth();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    category: formData.get("category") as string,
    startDate: (formData.get("startDate") as string) || undefined,
    targetDate: (formData.get("targetDate") as string) || undefined,
  };

  const parsed = goalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : new Date(),
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
    },
  });

  // Mirror the activity onto the couple timeline when the user has a partner.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coupleId: true },
  });

  if (user?.coupleId) {
    await prisma.timelineEvent.create({
      data: {
        coupleId: user.coupleId,
        userId,
        type: "GOAL_CREATED",
        title: `Created goal: ${goal.title}`,
      },
    });
  }

  redirect(`/goals/${goal.id}`);
}

export async function updateGoal(goalId: string, formData: FormData) {
  const { userId } = await requireAuth();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) return { error: "Not found" };

  const raw = {
    title: (formData.get("title") as string) || goal.title,
    description: (formData.get("description") as string) || undefined,
    category: (formData.get("category") as string) || goal.category,
    status: (formData.get("status") as string) || undefined,
    progress: formData.get("progress") !== null ? Number(formData.get("progress")) : undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    targetDate: (formData.get("targetDate") as string) || undefined,
  };

  const parsed = goalSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const oldStatus = goal.status;
  const newStatus = parsed.data.status;

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
    },
  });

  // Create timeline event if goal completed
  if (oldStatus !== "COMPLETED" && newStatus === "COMPLETED") {
    const couple = await prisma.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });
    if (couple?.coupleId) {
      await prisma.timelineEvent.create({
        data: {
          coupleId: couple.coupleId,
          userId,
          type: "GOAL_COMPLETED",
          title: `Completed goal: ${goal.title}`,
        },
      });
    }
  }

  return { success: true };
}

export async function deleteGoal(goalId: string) {
  const { userId } = await requireAuth();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) return { error: "Not found" };

  await prisma.goal.delete({ where: { id: goalId } });
  redirect("/goals");
}

export async function updateGoalProgress(goalId: string, data: { progress: number; status?: string }) {
  const { userId } = await requireAuth();

  const parsed = updateProgressSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) return { error: "Not found" };

  const oldStatus = goal.status;
  const newStatus = parsed.data.status || (parsed.data.progress === 100 ? "COMPLETED" : goal.status);

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      progress: parsed.data.progress,
      status: newStatus as any,
    },
  });

  // Timeline event on completion
  if (oldStatus !== "COMPLETED" && newStatus === "COMPLETED") {
    const couple = await prisma.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });
    if (couple?.coupleId) {
      await prisma.timelineEvent.create({
        data: {
          coupleId: couple.coupleId,
          userId,
          type: "GOAL_COMPLETED",
          title: `Completed goal: ${goal.title}`,
        },
      });
    }
  }

  return { success: true };
}

// ── Milestones ──────────────────────────────────────

export async function addMilestone(goalId: string, formData: FormData) {
  const { userId } = await requireAuth();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) return { error: "Not found" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = milestoneSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.goalMilestone.create({
    data: {
      goalId,
      title: parsed.data.title,
      description: parsed.data.description,
    },
  });

  return { success: true };
}

export async function toggleMilestone(milestoneId: string) {
  const { userId } = await requireAuth();

  const milestone = await prisma.goalMilestone.findUnique({
    where: { id: milestoneId },
    include: { goal: { select: { userId: true, title: true } } },
  });

  if (!milestone || milestone.goal.userId !== userId) return { error: "Not found" };

  const newCompleted = !milestone.isCompleted;

  await prisma.goalMilestone.update({
    where: { id: milestoneId },
    data: {
      isCompleted: newCompleted,
      completedAt: newCompleted ? new Date() : null,
    },
  });

  // Timeline event on milestone completion
  if (newCompleted) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });
    if (user?.coupleId) {
      await prisma.timelineEvent.create({
        data: {
          coupleId: user.coupleId,
          userId,
          type: "MILESTONE_COMPLETED",
          title: `Milestone completed: ${milestone.title} (${milestone.goal.title})`,
        },
      });
    }
  }

  return { success: true };
}

export async function deleteMilestone(milestoneId: string) {
  const { userId } = await requireAuth();

  const milestone = await prisma.goalMilestone.findUnique({
    where: { id: milestoneId },
    include: { goal: { select: { userId: true } } },
  });

  if (!milestone || milestone.goal.userId !== userId) return { error: "Not found" };

  await prisma.goalMilestone.delete({ where: { id: milestoneId } });
  return { success: true };
}

// ── Queries ─────────────────────────────────────────

export async function getGoals() {
  const { userId } = await requireAuth();

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: { milestones: true },
    orderBy: { createdAt: "desc" },
  });

  return goals;
}

export async function getGoal(goalId: string) {
  const { userId } = await requireAuth();

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!goal || goal.userId !== userId) return null;
  return goal;
}
