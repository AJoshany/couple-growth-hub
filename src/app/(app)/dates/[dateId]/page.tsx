import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DateDetailClient } from "./date-detail-client";

export default async function DateDetailPage({
  params,
}: {
  params: Promise<{ dateId: string }>;
}) {
  const { dateId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const event = await prisma.dateEvent.findUnique({
    where: { id: dateId },
    include: {
      planner: { select: { name: true } },
      memories: true,
    },
  });

  if (!event || event.coupleId !== session.user.coupleId) notFound();

  return <DateDetailClient event={event} />;
}
