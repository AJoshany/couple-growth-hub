import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PartnerProgressClient } from "./partner-progress-client";

export default async function PartnerPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  const partner = await prisma.user.findFirst({
    where: { coupleId: session.user.coupleId, id: { not: session.user.id } },
    select: { id: true, name: true, email: true },
  });

  return <PartnerProgressClient partnerName={partner?.name ?? "Your partner"} />;
}
