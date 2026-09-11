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

export async function addReadingItem(data: {
  title: string;
  author?: string;
  type?: string;
  url?: string;
}) {
  const { userId, coupleId } = await requireAuth();

  if (!data.title.trim()) {
    return { error: "Title cannot be empty" };
  }

  const item = await prisma.readingItem.create({
    data: {
      coupleId,
      addedById: userId,
      title: data.title.trim(),
      author: data.author?.trim() || null,
      type: (data.type as any) || "BOOK",
      url: data.url?.trim() || null,
    },
  });

  return { success: true, item };
}

export async function getReadingList() {
  const { coupleId } = await requireAuth();

  const items = await prisma.readingItem.findMany({
    where: { coupleId },
    include: {
      addedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items;
}

export async function updateReadingItem(
  itemId: string,
  data: {
    status?: string;
    rating?: number;
    notes?: string;
  }
) {
  const { coupleId } = await requireAuth();

  const item = await prisma.readingItem.findUnique({
    where: { id: itemId },
  });

  if (!item || item.coupleId !== coupleId) {
    return { error: "Not found" };
  }

  await prisma.readingItem.update({
    where: { id: itemId },
    data: {
      status: data.status as any || undefined,
      rating: data.rating,
      notes: data.notes?.trim() || undefined,
    },
  });

  return { success: true };
}

export async function deleteReadingItem(itemId: string) {
  const { coupleId } = await requireAuth();

  const item = await prisma.readingItem.findUnique({
    where: { id: itemId },
  });

  if (!item || item.coupleId !== coupleId) {
    return { error: "Not found" };
  }

  await prisma.readingItem.delete({
    where: { id: itemId },
  });

  return { success: true };
}

export async function getReadingStats() {
  const { coupleId } = await requireAuth();

  const items = await prisma.readingItem.findMany({
    where: { coupleId },
    select: { status: true, rating: true },
  });

  const total = items.length;
  const completed = items.filter((i) => i.status === "COMPLETED").length;
  const reading = items.filter((i) => i.status === "READING").length;
  const toRead = items.filter((i) => i.status === "TO_READ").length;
  const rated = items.filter((i) => i.rating !== null);
  const avgRating =
    rated.length > 0
      ? Math.round((rated.reduce((sum, i) => sum + (i.rating || 0), 0) / rated.length) * 10) / 10
      : 0;

  return {
    total,
    completed,
    reading,
    toRead,
    avgRating,
  };
}
