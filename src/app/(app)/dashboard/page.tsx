import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Target,
  Users,
  Calendar,
  Sparkles,
  Heart,
  Trophy,
  BookOpen,
  BarChart3,
  ArrowRight,
  Clock,
  Circle,
  CheckCircle2,
} from "lucide-react";

const MOOD = ["", "Rough", "Low", "Okay", "Good", "Great"];
const ENERGY = ["", "Drained", "Tired", "Steady", "Energized", "Peak"];
const PRODUCTIVITY = ["", "Slow", "Light", "Steady", "Productive", "Crushing it"];

const TIMELINE_STYLES: Record<string, string> = {
  GOAL_CREATED: "bg-primary/10 text-primary",
  GOAL_COMPLETED: "bg-emerald-500/10 text-emerald-600",
  MILESTONE_COMPLETED: "bg-emerald-500/10 text-emerald-600",
  SHARED_GOAL_CREATED: "bg-primary/10 text-primary",
  SHARED_GOAL_COMPLETED: "bg-emerald-500/10 text-emerald-600",
  SHARED_MILESTONE_COMPLETED: "bg-emerald-500/10 text-emerald-600",
  DATE_PLANNED: "bg-amber-500/10 text-amber-600",
  DATE_COMPLETED: "bg-amber-500/10 text-amber-600",
  MEMORY_ADDED: "bg-primary/10 text-primary",
  JOURNAL_ENTRY: "bg-sky-500/10 text-sky-600",
  RELATIONSHIP_EVENT: "bg-primary/10 text-primary",
  COUPLE_CREATED: "bg-primary/10 text-primary",
};

function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "numeric", year: "numeric" }
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="bg-brand-gradient h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const userId = session.user.id;
  const coupleId = session.user.coupleId;

  if (!coupleId) return <NoCoupleState />;

  const couple = await prisma.couple.findUnique({
    where: { id: coupleId },
    include: { users: { select: { id: true, name: true } } },
  });
  if (!couple) redirect("/setup");

  const partner = couple.users.find((u) => u.id !== userId) ?? null;
  const myName = couple.users.find((u) => u.id === userId)?.name ?? "there";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 86_400_000);
  const memberIds = couple.users.map((u) => u.id);

  const [
    myGoals,
    sharedGoals,
    nextDate,
    lastDate,
    todayJournal,
    todayLog,
    missingEntries,
    memories,
    recentEvents,
    completedMilestones,
  ] = await Promise.all([
    prisma.goal.findMany({
      where: { userId, status: { not: "CANCELLED" } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 4,
      select: {
        id: true,
        title: true,
        category: true,
        progress: true,
        status: true,
      },
    }),
    prisma.sharedGoal.findMany({
      where: { coupleId, status: { not: "CANCELLED" } },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, title: true, category: true, progress: true },
    }),
    prisma.dateEvent.findFirst({
      where: { coupleId, isCompleted: false, date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.dateEvent.findFirst({
      where: { coupleId, isCompleted: true, date: { lte: now } },
      orderBy: { date: "desc" },
    }),
    prisma.journalEntry.findFirst({
      where: {
        userId,
        date: { gte: startOfToday, lt: startOfTomorrow },
      },
    }),
    prisma.dailyLog.findFirst({
      where: { userId, date: { gte: startOfToday, lt: startOfTomorrow } },
      include: {
        activities: { orderBy: { createdAt: "asc" }, take: 4 },
      },
    }),
    prisma.missingEntry.findMany({
      where: {
        userId: { in: memberIds },
        date: { gte: startOfToday, lt: startOfTomorrow },
      },
    }),
    prisma.memory.findMany({
      where: { coupleId },
      orderBy: { date: "desc" },
      take: 3,
    }),
    prisma.timelineEvent.findMany({
      where: { coupleId },
      orderBy: { date: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
    prisma.goalMilestone.count({
      where: { goal: { userId }, isCompleted: true },
    }),
  ]);

  const daysTogether = couple.startDate
    ? Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(couple.startDate).getTime()) / 86_400_000
        )
      )
    : null;

  const daysToNext = nextDate
    ? Math.ceil(
        (new Date(nextDate.date).setHours(0, 0, 0, 0) -
          startOfToday.getTime()) /
          86_400_000
      )
    : null;

  const myMissing = missingEntries.find((m) => m.userId === userId)?.value ?? null;
  const partnerMissing =
    missingEntries.find((m) => m.userId !== userId)?.value ?? null;

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const partnerName = partner?.name.split(" ")[0] ?? null;
  const activeGoals = myGoals.filter((g) => g.status !== "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="brand-glow pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white">
              <Heart className="size-3" fill="currentColor" />
              {couple.name ?? "Your couple space"}
            </span>
            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
              {greeting}, {myName.split(" ")[0]}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {partnerName
                ? `You and ${partnerName} are building something meaningful together.`
                : "Invite your partner to start sharing your journey."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/journal">
                <Button className="h-9 px-4">
                  <BookOpen className="size-4" />
                  {todayJournal ? "Edit today's entry" : "Log today's entry"}
                </Button>
              </Link>
              <Link href="/dates/new">
                <Button variant="outline" className="h-9 px-4">
                  <Calendar className="size-4" />
                  Plan a date
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border bg-background/80 p-4 text-center backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Together
              </p>
              <p className="text-brand-gradient mt-1 text-3xl font-semibold tabular-nums">
                {daysTogether ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {daysTogether === null ? "add a start date" : "days"}
              </p>
            </div>
            <div className="rounded-xl border bg-background/80 p-4 text-center backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Next date
              </p>
              <p className="text-brand-gradient mt-1 text-3xl font-semibold tabular-nums">
                {daysToNext === null ? "—" : daysToNext <= 0 ? "Today" : daysToNext}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {daysToNext === null
                  ? "nothing planned"
                  : daysToNext <= 0
                    ? nextDate?.title
                    : `days · ${nextDate?.title}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Target className="size-4" />}
          label="Active goals"
          value={String(activeGoals)}
          sub={`${completedMilestones} milestones done`}
          href="/goals"
        />
        <StatCard
          icon={<Trophy className="size-4" />}
          label="Shared goals"
          value={String(sharedGoals.length)}
          sub="building together"
          href="/shared-goals"
        />
        <StatCard
          icon={<BookOpen className="size-4" />}
          label="Today's check-in"
          value={todayJournal ? "Logged" : "Pending"}
          sub={todayJournal ? MOOD[todayJournal.mood ?? 0] || "Nice" : "How was today?"}
          href="/journal"
        />
        <StatCard
          icon={<Sparkles className="size-4" />}
          label="Last date"
          value={lastDate ? formatDate(lastDate.date, { month: "short", day: "numeric" }) : "—"}
          sub={lastDate?.title ?? "no dates yet"}
          href="/dates"
        />
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* My goals */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">Your goals</h3>
                <p className="text-xs text-muted-foreground">
                  Keep your momentum going
                </p>
              </div>
              <Link
                href="/goals"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            {myGoals.length === 0 ? (
              <EmptyRow
                icon={<Target className="size-5" />}
                text="No goals yet — set your first one."
                href="/goals/new"
                cta="Create a goal"
              />
            ) : (
              <ul className="mt-4 space-y-4">
                {myGoals.map((goal) => (
                  <li key={goal.id}>
                    <Link href={`/goals/${goal.id}`} className="group block">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium group-hover:text-primary">
                          {goal.title}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={goal.progress} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Shared goals */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">Shared goals</h3>
                <p className="text-xs text-muted-foreground">
                  What you&apos;re building together
                </p>
              </div>
              <Link
                href="/shared-goals"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            {sharedGoals.length === 0 ? (
              <EmptyRow
                icon={<Trophy className="size-5" />}
                text="No shared goals yet — dream one up together."
                href="/shared-goals/new"
                cta="Add a shared goal"
              />
            ) : (
              <ul className="mt-4 space-y-4">
                {sharedGoals.map((goal) => (
                  <li key={goal.id}>
                    <Link href={`/shared-goals/${goal.id}`} className="group block">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium group-hover:text-primary">
                          {goal.title}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={goal.progress} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Recent activity */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold">Recent activity</h3>
              <Link
                href="/timeline"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Timeline <ArrowRight className="size-3" />
              </Link>
            </div>
            {recentEvents.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Your story is just beginning. Activity will show up here.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recentEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                        TIMELINE_STYLES[event.type] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Clock className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      {event.detail && (
                        <p className="truncate text-xs text-muted-foreground">
                          {event.detail}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(event.date, { month: "short", day: "numeric" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Today's check-in */}
          <Card className="p-5 sm:p-6">
            <h3 className="text-sm font-semibold">Today</h3>
            {todayJournal ? (
              <div className="mt-4 space-y-4">
                <Meter label="Mood" value={todayJournal.mood} words={MOOD} />
                <Meter label="Energy" value={todayJournal.energy} words={ENERGY} />
                <Meter
                  label="Productivity"
                  value={todayJournal.productivity}
                  words={PRODUCTIVITY}
                />
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t checked in today.
              </p>
            )}

            {todayLog && todayLog.activities.length > 0 && (
              <div className="mt-5 border-t pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Activities
                </p>
                <ul className="mt-3 space-y-2">
                  {todayLog.activities.map((activity) => (
                    <li key={activity.id} className="flex items-start gap-2 text-sm">
                      {activity.isCompleted ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                      )}
                      <span
                        className={
                          activity.isCompleted
                            ? "text-muted-foreground line-through"
                            : ""
                        }
                      >
                        {activity.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/journal" className="mt-5 block">
              <Button variant="outline" className="h-9 w-full">
                {todayJournal ? "Open today's entry" : "Check in now"}
              </Button>
            </Link>
          </Card>

          {/* Missing each other */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-primary" fill="currentColor" />
              <h3 className="text-sm font-semibold">Missing each other</h3>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              A gentle check-in, not a scoreboard.
            </p>
            <div className="mt-4 space-y-4">
              <MissingRow label="You" value={myMissing} />
              <MissingRow label={partnerName ?? "Partner"} value={partnerMissing} />
            </div>
            <Link href="/relationship" className="mt-5 block">
              <Button variant="outline" className="h-9 w-full">
                Update how you feel
              </Button>
            </Link>
          </Card>

          {/* Next date */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">
                {nextDate ? "Next date" : "No date planned"}
              </h3>
            </div>
            {nextDate ? (
              <>
                <p className="mt-3 text-base font-medium">{nextDate.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(nextDate.date, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                {nextDate.location && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nextDate.location}
                  </p>
                )}
                <Link href={`/dates/${nextDate.id}`} className="mt-4 block">
                  <Button variant="outline" className="h-9 w-full">
                    View details
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  Plan something to look forward to.
                </p>
                <Link href="/dates/new" className="mt-4 block">
                  <Button className="h-9 w-full">Plan a date</Button>
                </Link>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="text-sm font-semibold">Quick actions</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            href="/goals/new"
            icon={<Target className="size-5" />}
            title="New goal"
            description="Set a personal goal"
          />
          <QuickAction
            href="/shared-goals/new"
            icon={<Trophy className="size-5" />}
            title="Shared goal"
            description="Dream one up together"
          />
          <QuickAction
            href="/memories/new"
            icon={<Sparkles className="size-5" />}
            title="Add memory"
            description="Save a moment"
          />
          <QuickAction
            href="/partner"
            icon={<Users className="size-5" />}
            title="Partner progress"
            description="See how they're doing"
          />
          <QuickAction
            href="/weekly"
            icon={<BarChart3 className="size-5" />}
            title="Weekly review"
            description="Your week at a glance"
          />
          <QuickAction
            href="/timeline"
            icon={<Clock className="size-5" />}
            title="Timeline"
            description="Browse your story"
          />
        </div>
      </section>

      {/* Recent memories */}
      {memories.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">Recent memories</h3>
            <Link
              href="/memories"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              All memories <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <Link key={memory.id} href={`/memories/${memory.id}`}>
                <Card className="h-full p-5 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    {formatDate(memory.date)}
                  </div>
                  <h4 className="mt-3 line-clamp-1 font-medium">{memory.title}</h4>
                  {memory.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {memory.description}
                    </p>
                  )}
                  {memory.location && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {memory.location}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full p-4 transition-colors hover:bg-muted/50">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-primary">{icon}</span>
          {label}
        </div>
        <p className="mt-3 truncate text-2xl font-semibold">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </Card>
    </Link>
  );
}

function Meter({
  label,
  value,
  words,
}: {
  label: string;
  value: number | null;
  words: string[];
}) {
  const score = value ?? 0;
  const word = value ? words[value] : null;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{word ?? "—"}</span>
      </div>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= score ? "bg-brand-gradient" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function MissingRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value === null ? "—" : `${value}%`}
        </span>
      </div>
      <div className="mt-2">
        <ProgressBar value={value ?? 0} />
      </div>
    </div>
  );
}

function EmptyRow({
  icon,
  text,
  href,
  cta,
}: {
  icon: React.ReactNode;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="flex-1 text-sm text-muted-foreground">{text}</p>
      <Link href={href}>
        <Button variant="outline" className="h-8 shrink-0">
          {cta}
        </Button>
      </Link>
    </div>
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
      <Card className="h-full p-4 transition-colors hover:bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{title}</p>
            <p className="truncate text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function NoCoupleState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="bg-brand-gradient flex size-14 items-center justify-center rounded-2xl text-white shadow-sm">
        <Heart className="size-6" fill="currentColor" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold">Welcome to Couple Growth</h2>
        <p className="mt-2 text-muted-foreground">
          Create your couple space or join your partner to get started.
        </p>
      </div>
      <Link href="/setup">
        <Button className="h-10 px-6">Set up your couple</Button>
      </Link>
    </div>
  );
}
