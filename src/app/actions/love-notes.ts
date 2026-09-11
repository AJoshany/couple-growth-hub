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

export async function sendLoveNote(content: string) {
  const { userId, coupleId } = await requireAuth();

  if (!content.trim()) {
    return { error: "Note cannot be empty" };
  }

  const note = await prisma.loveNote.create({
    data: {
      coupleId,
      senderId: userId,
      content: content.trim(),
    },
  });

  return { success: true, note };
}

export async function getLoveNotes() {
  const { userId, coupleId } = await requireAuth();

  const notes = await prisma.loveNote.findMany({
    where: { coupleId },
    include: {
      sender: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notes;
}

export async function getUnreadCount() {
  const { userId, coupleId } = await requireAuth();

  const count = await prisma.loveNote.count({
    where: {
      coupleId,
      senderId: { not: userId },
      isRead: false,
    },
  });

  return count;
}

export async function markAsRead(noteId: string) {
  const { userId, coupleId } = await requireAuth();

  const note = await prisma.loveNote.findUnique({
    where: { id: noteId },
  });

  if (!note || note.coupleId !== coupleId || note.senderId === userId) {
    return { error: "Not found" };
  }

  await prisma.loveNote.update({
    where: { id: noteId },
    data: { isRead: true },
  });

  return { success: true };
}

export async function markAllAsRead() {
  const { userId, coupleId } = await requireAuth();

  await prisma.loveNote.updateMany({
    where: {
      coupleId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: true };
}
