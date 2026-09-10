import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Target,
  Users,
  Calendar,
  Sparkles,
  Heart,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const coupleId = session!.user.coupleId;

  // No couple yet — show setup
  if (!coupleId) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to Couple Growth Hub</h1>
          <p className="mt-2 text-muted-foreground">
            Start by creating your couple or joining your partner.
          </p>
        </div>
        <SetupActions />
      </div>
    );
  }

  // Fetch dashboard data
  const [couple, user, nextDate, lastDate, goalsCount, journalToday, memories] =
    await Promise.all([
      prisma.couple.findUnique({
        where: { id: coupleId },
        include: {
          users: { select: { id: true, name: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      prisma.dateEvent.findFirst({
        where: {
          coupleId,
          isCompleted: false,
          date: { gte: new Date() },
        },
        orderBy: { date: "asc" },
      }),
      prisma.dateEvent.findFirst({
        where: {
          coupleId,
          isCompleted: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.goal.count({
        where: { userId, status: { notIn: ["CANCELLED"] } },
      }),
      prisma.journalEntry.findFirst({
        where: { userId, date: new Date() },
      }),
      prisma.memory.findMany({
        where: { coupleId },
        orderBy: { date: "desc" },
        take: 3,
      }),
    ]);

  const partner = couple?.users.find((u: { id: string }) => u.id !== userId);
  const daysTogether = couple?.startDate
    ? Math.floor(
        (Date.now() - new Date(couple.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          {partner
            ? `Growing together with ${partner.name}`
            : "Your journey starts here"}
          {daysTogether !== null && ` · ${daysTogether} days together`}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Calendar className="size-4" />}
          label="Next Date"
          value={
            nextDate
              ? new Date(nextDate.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "None planned"
          }
          sub={
            nextDate
              ? `${Math.ceil((new Date(nextDate.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days away`
              : undefined
          }
        />
        <StatCard
          icon={<Target className="size-4" />}
          label="Active Goals"
          value={goalsCount.toString()}
        />
        <StatCard
          icon={<Heart className="size-4" />}
          label="Journal Today"
          value={journalToday ? "✓ Logged" : "Not yet"}
        />
        <StatCard
          icon={<Sparkles className="size-4" />}
          label="Memories"
          value={memories.length.toString()}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          href="/goals/new"
          icon={<Target className="size-5" />}
          title="New Goal"
          description="Set a personal goal"
        />
        <QuickAction
          href="/journal"
          icon={<Heart className="size-5" />}
          title="Today's Journal"
          description="Log how your day went"
        />
        <QuickAction
          href="/dates/new"
          icon={<Calendar className="size-5" />}
          title="Plan a Date"
          description="Schedule your next meeting"
        />
        <QuickAction
          href="/partner"
          icon={<Users className="size-5" />}
          title="Partner Progress"
          description="See how they're doing"
        />
        <QuickAction
          href="/memories/new"
          icon={<Sparkles className="size-5" />}
          title="Add Memory"
          description="Save a special moment"
        />
        <QuickAction
          href="/weekly"
          icon={<Target className="size-5" />}
          title="Weekly Review"
          description="See your week at a glance"
        />
      </div>

      {/* Recent Memories */}
      {memories.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent Memories</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {memories.map((memory: { id: string; title: string; date: string | Date; description?: string | null }) => (
              <Link key={memory.id} href={`/memories/${memory.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{memory.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(memory.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {memory.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {memory.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SetupActions() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Link href="/setup">
        <Button size="lg">Get Started</Button>
      </Link>
    </div>
  );
}
