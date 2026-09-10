import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      couple: {
        select: {
          name: true,
          users: { select: { id: true, name: true } },
        },
      },
    },
  });

  const name = user?.name ?? session.user.name ?? "You";
  const email = user?.email ?? session.user.email ?? "";
  const partnerName =
    user?.couple?.users.find((u) => u.id !== session.user.id)?.name ?? null;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar user={{ name, email, partnerName }} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={{ name, email }} />
        <main className="scrollbar-slim flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
