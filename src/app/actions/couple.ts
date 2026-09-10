"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCoupleSchema } from "@/lib/validations/couple";

export async function createCouple(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: (formData.get("name") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
  };

  const parsed = createCoupleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Check if user already has a couple
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coupleId: true },
  });

  if (user?.coupleId) {
    return { error: { name: ["You are already in a couple"] } };
  }

  const couple = await prisma.couple.create({
    data: {
      name: parsed.data.name,
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate)
        : undefined,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { coupleId: couple.id, coupleRole: "OWNER" },
  });

  await prisma.timelineEvent.create({
    data: {
      coupleId: couple.id,
      userId: session.user.id,
      type: "COUPLE_CREATED",
      title: "Started their journey together",
    },
  });

  redirect("/dashboard");
}

export async function generateInvitation() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coupleId: true },
  });

  if (!user?.coupleId) {
    return { error: { code: ["Create a couple first"] } };
  }

  // Invalidate old pending invitations
  await prisma.invitation.updateMany({
    where: {
      senderId: session.user.id,
      status: "PENDING",
    },
    data: { status: "EXPIRED" },
  });

  const code = randomBytes(16).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: {
      code,
      senderId: session.user.id,
      expiresAt,
    },
  });

  return { code: invitation.code };
}

export async function acceptInvitation(code: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const invitation = await prisma.invitation.findUnique({
    where: { code },
    include: { sender: { select: { coupleId: true } } },
  });

  if (!invitation) {
    return { error: { code: ["Invalid invitation code"] } };
  }

  if (invitation.status !== "PENDING") {
    return { error: { code: ["This invitation has already been used"] } };
  }

  if (new Date() > invitation.expiresAt) {
    return { error: { code: ["This invitation has expired"] } };
  }

  if (invitation.senderId === session.user.id) {
    return { error: { code: ["You cannot accept your own invitation"] } };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coupleId: true },
  });

  if (currentUser?.coupleId) {
    return { error: { code: ["You are already in a couple"] } };
  }

  if (!invitation.sender?.coupleId) {
    return { error: { code: ["The sender no longer has a couple"] } };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      coupleId: invitation.sender.coupleId,
      coupleRole: "MEMBER",
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED", receiverId: session.user.id },
  });

  redirect("/dashboard");
}

export async function getPartnerInfo() {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) return null;

  const partner = await prisma.user.findFirst({
    where: {
      coupleId: session.user.coupleId,
      id: { not: session.user.id },
    },
    select: { id: true, name: true, email: true },
  });

  return partner;
}

export async function getCoupleInfo() {
  const session = await auth();
  if (!session?.user?.id || !session.user.coupleId) return null;

  const couple = await prisma.couple.findUnique({
    where: { id: session.user.coupleId },
    include: {
      users: { select: { id: true, name: true, email: true } },
    },
  });

  return couple;
}
