import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalList } from "@/components/journal/journal-list";

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const today = new Date().toISOString().split("T")[0];

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 90,
  });

  return (
    <JournalList entries={entries} today={today} />
  );
}
