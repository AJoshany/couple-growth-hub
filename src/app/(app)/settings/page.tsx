import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      coupleId: true,
      coupleRole: true,
    },
  });

  const couple = user?.coupleId
    ? await prisma.couple.findUnique({
        where: { id: user.coupleId },
        include: { users: { select: { id: true, name: true, email: true } } },
      })
    : null;

  const pendingInvitation = user?.coupleId
    ? await prisma.invitation.findFirst({
        where: { senderId: session.user.id, status: "PENDING" },
        select: { code: true, expiresAt: true },
      })
    : null;

  return (
    <SettingsClient
      user={user!}
      couple={couple}
      pendingInvitation={pendingInvitation}
    />
  );
}
