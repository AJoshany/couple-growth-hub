import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemoriesListClient } from "./memories-list-client";

export default async function MemoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const memories = await prisma.memory.findMany({
    where: { coupleId: session.user.coupleId },
    include: {
      creator: { select: { name: true } },
      dateEvent: { select: { title: true } },
    },
    orderBy: { date: "desc" },
  });

  return <MemoriesListClient memories={memories} />;
}
