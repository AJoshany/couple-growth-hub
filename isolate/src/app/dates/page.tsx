import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DatesListClient } from "./dates-list-client";

export default async function DatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const events = await prisma.dateEvent.findMany({
    where: { coupleId: session.user.coupleId },
    include: { planner: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return <DatesListClient events={events} />;
}
