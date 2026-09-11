import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalList } from "@/components/journal/journal-list";
import { MoodAnalytics } from "@/components/mood-analytics";

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
    <div className="space-y-6">
      <MoodAnalytics
        entries={entries.map((e) => ({
          date: e.date,
          mood: e.mood,
          energy: e.energy,
          productivity: e.productivity,
        }))}
      />
      <JournalList entries={entries} today={today} />
    </div>
  );
}
