import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemoryForm } from "@/components/memories/memory-form";

export default async function NewMemoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const dateEvents = await prisma.dateEvent.findMany({
    where: { coupleId: session.user.coupleId!, isCompleted: true },
    select: { id: true, title: true, date: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="flex justify-center py-6">
      <MemoryForm mode="create" dateEvents={dateEvents} />
    </div>
  );
}
