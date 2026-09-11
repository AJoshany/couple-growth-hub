import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TimelineClient } from "./timeline-client";

export default async function TimelinePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const events = await prisma.timelineEvent.findMany({
    where: { coupleId: session.user.coupleId },
    include: { user: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 100,
  });

  return <TimelineClient events={events} />;
}
