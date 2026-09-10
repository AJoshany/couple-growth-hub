"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dateEventSchema } from "@/lib/validations/date-event";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id, coupleId: session.user.coupleId };
}

export async function createDateEvent(formData: FormData) {
  const { userId, coupleId } = await requireAuth();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    date: formData.get("date") as string,
    type: (formData.get("type") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = dateEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const dateEvent = await prisma.dateEvent.create({
    data: {
      coupleId,
      plannerId: userId,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      notes: parsed.data.notes,
    },
  });

  // Timeline event
  await prisma.timelineEvent.create({
    data: {
      coupleId,
      userId,
      type: "DATE_PLANNED",
      title: `Planned date: ${dateEvent.title}`,
    },
  });

  redirect(`/dates/${dateEvent.id}`);
}

export async function updateDateEvent(dateId: string, formData: FormData) {
  const { userId, coupleId } = await requireAuth();

  const event = await prisma.dateEvent.findUnique({ where: { id: dateId } });
  if (!event || event.coupleId !== coupleId) return { error: "Not found" };

  const raw = {
    title: (formData.get("title") as string) || event.title,
    description: (formData.get("description") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    date: (formData.get("date") as string) || undefined,
    type: (formData.get("type") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = dateEventSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.dateEvent.update({
    where: { id: dateId },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
  });

  return { success: true };
}

export async function completeDateEvent(dateId: string) {
  const { coupleId } = await requireAuth();

  const event = await prisma.dateEvent.findUnique({ where: { id: dateId } });
  if (!event || event.coupleId !== coupleId) return { error: "Not found" };

  await prisma.dateEvent.update({
    where: { id: dateId },
    data: { isCompleted: true },
  });

  // Timeline event
  await prisma.timelineEvent.create({
    data: {
      coupleId,
      userId: event.plannerId,
      type: "DATE_COMPLETED",
      title: `Completed date: ${event.title}`,
    },
  });

  return { success: true };
}

export async function deleteDateEvent(dateId: string) {
  const { coupleId } = await requireAuth();

  const event = await prisma.dateEvent.findUnique({ where: { id: dateId } });
  if (!event || event.coupleId !== coupleId) return { error: "Not found" };

  await prisma.dateEvent.delete({ where: { id: dateId } });
  redirect("/dates");
}

export async function getDateEvents() {
  const { coupleId } = await requireAuth();

  const events = await prisma.dateEvent.findMany({
    where: { coupleId },
    include: { planner: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return events;
}

export async function getDateEvent(dateId: string) {
  const { coupleId } = await requireAuth();

  const event = await prisma.dateEvent.findUnique({
    where: { id: dateId },
    include: {
      planner: { select: { name: true } },
      memories: true,
    },
  });

  if (!event || event.coupleId !== coupleId) return null;
  return event;
}

export async function getNextDate() {
  const { coupleId } = await requireAuth();

  const nextDate = await prisma.dateEvent.findFirst({
    where: { coupleId, isCompleted: false, date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  return nextDate;
}
