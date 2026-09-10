"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { memorySchema } from "@/lib/validations/memory";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id, coupleId: session.user.coupleId };
}

export async function createMemory(formData: FormData) {
  const { userId, coupleId } = await requireAuth();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    date: formData.get("date") as string,
    dateEventId: (formData.get("dateEventId") as string) || undefined,
  };

  const parsed = memorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const memory = await prisma.memory.create({
    data: {
      coupleId,
      userId,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      date: new Date(parsed.data.date),
      dateEventId: parsed.data.dateEventId || null,
    },
  });

  // Timeline event
  await prisma.timelineEvent.create({
    data: {
      coupleId,
      userId,
      type: "MEMORY_ADDED",
      title: `New memory: ${memory.title}`,
    },
  });

  redirect(`/memories/${memory.id}`);
}

export async function updateMemory(memoryId: string, formData: FormData) {
  const { userId, coupleId } = await requireAuth();

  const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
  if (!memory || memory.coupleId !== coupleId) return { error: "Not found" };

  const raw = {
    title: (formData.get("title") as string) || memory.title,
    description: (formData.get("description") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    date: (formData.get("date") as string) || undefined,
    dateEventId: (formData.get("dateEventId") as string) || undefined,
  };

  const parsed = memorySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.memory.update({
    where: { id: memoryId },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      dateEventId: parsed.data.dateEventId || null,
    },
  });

  return { success: true };
}

export async function deleteMemory(memoryId: string) {
  const { coupleId } = await requireAuth();

  const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
  if (!memory || memory.coupleId !== coupleId) return { error: "Not found" };

  await prisma.memory.delete({ where: { id: memoryId } });
  redirect("/memories");
}

export async function getMemories() {
  const { coupleId } = await requireAuth();

  const memories = await prisma.memory.findMany({
    where: { coupleId },
    include: {
      creator: { select: { name: true } },
      dateEvent: { select: { title: true, date: true } },
    },
    orderBy: { date: "desc" },
  });

  return memories;
}

export async function getMemory(memoryId: string) {
  const { coupleId } = await requireAuth();

  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    include: {
      creator: { select: { name: true } },
      dateEvent: { select: { id: true, title: true, date: true } },
    },
  });

  if (!memory || memory.coupleId !== coupleId) return null;
  return memory;
}

export async function getLinkedDateEvents() {
  const { coupleId } = await requireAuth();

  const events = await prisma.dateEvent.findMany({
    where: { coupleId, isCompleted: true },
    select: { id: true, title: true, date: true },
    orderBy: { date: "desc" },
  });

  return events;
}
