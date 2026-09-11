import { prisma } from "@/lib/prisma";

export interface ExportData {
  exportedAt: string;
  user: {
    name: string;
    email: string;
  };
  goals: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    status: string;
    progress: number;
    startDate: Date | null;
    targetDate: Date | null;
    createdAt: Date;
    milestones: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
      completedAt: Date | null;
    }>;
  }>;
  memories: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    date: Date;
    createdAt: Date;
  }>;
  journalEntries: Array<{
    id: string;
    date: Date;
    summary: string | null;
    accomplishments: string | null;
    learned: string | null;
    difficult: string | null;
    tomorrow: string | null;
    mood: number | null;
    energy: number | null;
    productivity: number | null;
    createdAt: Date;
  }>;
  dateEvents: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    date: Date;
    type: string | null;
    isCompleted: boolean;
    createdAt: Date;
  }>;
}

export async function exportUserData(userId: string): Promise<ExportData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, coupleId: true },
  });

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      milestones: {
        select: {
          id: true,
          title: true,
          isCompleted: true,
          completedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const memories = await prisma.memory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const journalEntries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const dateEvents = await prisma.dateEvent.findMany({
    where: { coupleId: user?.coupleId || "" },
    orderBy: { createdAt: "desc" },
  });

  return {
    exportedAt: new Date().toISOString(),
    user: {
      name: user?.name || "Unknown",
      email: user?.email || "",
    },
    goals,
    memories,
    journalEntries,
    dateEvents,
  };
}

export function downloadAsJSON(data: ExportData, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsCSV(data: ExportData): void {
  // Create CSV for journal entries
  const journalHeaders = [
    "Date",
    "Summary",
    "Accomplishments",
    "Learned",
    "Difficult",
    "Tomorrow",
    "Mood",
    "Energy",
    "Productivity",
  ];

  const journalRows = data.journalEntries.map((entry) => [
    new Date(entry.date).toLocaleDateString(),
    entry.summary || "",
    entry.accomplishments || "",
    entry.learned || "",
    entry.difficult || "",
    entry.tomorrow || "",
    entry.mood?.toString() || "",
    entry.energy?.toString() || "",
    entry.productivity?.toString() || "",
  ]);

  const journalCSV = [
    journalHeaders.join(","),
    ...journalRows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // Create CSV for goals
  const goalHeaders = [
    "Title",
    "Description",
    "Category",
    "Status",
    "Progress",
    "Start Date",
    "Target Date",
  ];

  const goalRows = data.goals.map((goal) => [
    goal.title,
    goal.description || "",
    goal.category,
    goal.status,
    goal.progress.toString(),
    goal.startDate ? new Date(goal.startDate).toLocaleDateString() : "",
    goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "",
  ]);

  const goalCSV = [
    goalHeaders.join(","),
    ...goalRows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // Download files
  const journalBlob = new Blob([journalCSV], { type: "text/csv" });
  const goalBlob = new Blob([goalCSV], { type: "text/csv" });

  const journalUrl = URL.createObjectURL(journalBlob);
  const goalUrl = URL.createObjectURL(goalBlob);

  const journalLink = document.createElement("a");
  journalLink.href = journalUrl;
  journalLink.download = "journal-entries.csv";
  document.body.appendChild(journalLink);
  journalLink.click();
  document.body.removeChild(journalLink);

  const goalLink = document.createElement("a");
  goalLink.href = goalUrl;
  goalLink.download = "goals.csv";
  document.body.appendChild(goalLink);
  goalLink.click();
  document.body.removeChild(goalLink);

  URL.revokeObjectURL(journalUrl);
  URL.revokeObjectURL(goalUrl);
}
