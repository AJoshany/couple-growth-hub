import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalEntryPageClient } from "./journal-entry-page-client";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const d = new Date(date + "T00:00:00");

  const entry = await prisma.journalEntry.findUnique({
    where: { userId_date: { userId: session.user.id, date: d } },
  });

  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: session.user.id, date: d } },
    create: { userId: session.user.id, date: d },
    update: {},
    include: { activities: { orderBy: { createdAt: "asc" } } },
  });

  // Get user's goals for activity linking
  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id, status: { notIn: ["CANCELLED"] } },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <JournalEntryPageClient
      date={date}
      entry={entry}
      log={log}
      goals={goals}
    />
  );
}
