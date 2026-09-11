import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemoryDetailClient } from "./memory-detail-client";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ memoryId: string }>;
}) {
  const { memoryId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    include: {
      creator: { select: { name: true } },
      dateEvent: { select: { id: true, title: true, date: true } },
    },
  });

  if (!memory || memory.coupleId !== session.user.coupleId) notFound();

  return <MemoryDetailClient memory={memory} />;
}
