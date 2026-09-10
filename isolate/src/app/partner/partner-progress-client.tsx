"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  getPartnerGoals,
  getPartnerJournalEntries,
  getPartnerMoodTrend,
  getPartnerCompletedMilestones,
} from "@/app/actions/partner";
import {
  Users,
  Target,
  BookOpen,
  Trophy,
  TrendingUp,
  Sparkles,
} from "lucide-react";

type Goal = {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  milestones: { id: string; title: string; isCompleted: boolean }[];
};

type JournalEntry = {
  id: string;
  date: Date;
  summary: string | null;
  mood: number | null;
  energy: number | null;
  productivity: number | null;
};

type MoodEntry = {
  date: Date;
  mood: number | null;
  energy: number | null;
  productivity: number | null;
};

type Milestone = {
  id: string;
  title: string;
  completedAt: Date | null;
  goal: { title: string };
};

const moodEmojis: Record<number, string> = {
  1: "😞",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "🤩",
};

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
};

export function PartnerProgressClient({
  partnerName,
}: {
  partnerName: string;
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [moodTrend, setMoodTrend] = useState<MoodEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [g, j, m, ms] = await Promise.all([
        getPartnerGoals(),
        getPartnerJournalEntries(),
        getPartnerMoodTrend(),
        getPartnerCompletedMilestones(),
      ]);
      setGoals(g);
      setJournalEntries(j);
      setMoodTrend(m);
      setMilestones(ms);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{partnerName}&apos;s Progress</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-3 h-3 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const avgMood =
    moodTrend.length > 0
      ? (moodTrend.reduce((s, e) => s + (e.mood || 0), 0) / moodTrend.length).toFixed(1)
      : null;
  const avgEnergy =
    moodTrend.length > 0
      ? (moodTrend.reduce((s, e) => s + (e.energy || 0), 0) / moodTrend.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{partnerName}&apos;s Progress</h1>
          <p className="text-muted-foreground">
            See how your partner is growing
          </p>
        </div>
      </div>

      {/* Mood Summary */}
      {avgMood && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg Mood</p>
              <p className="mt-1 text-2xl font-bold">
                {moodEmojis[Math.round(Number(avgMood))]} {avgMood}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg Energy</p>
              <p className="mt-1 text-2xl font-bold">⚡ {avgEnergy}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Journal Days</p>
              <p className="mt-1 text-2xl font-bold">{journalEntries.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Goals */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Target className="size-5" /> Active Goals
        </h2>
        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active goals yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge
                      variant="secondary"
                      className={statusColors[goal.status] || ""}
                    >
                      {goal.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {goal.category}
                  </Badge>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="mt-1 h-2" />
                  </div>
                  {goal.milestones.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {goal.milestones.filter((m) => m.isCompleted).length}/
                      {goal.milestones.length} milestones
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Journal (partner-visible only) */}
      {journalEntries.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="size-5" /> Recent Journal Entries
            <Badge variant="secondary" className="text-xs">
              Partner-visible only
            </Badge>
          </h2>
          <div className="space-y-2">
            {journalEntries.slice(0, 7).map((entry) => (
              <Card key={entry.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="text-sm font-medium">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    {entry.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {entry.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.mood && (
                      <span title="Mood">{moodEmojis[entry.mood]}</span>
                    )}
                    {entry.energy && (
                      <span className="text-xs text-muted-foreground">
                        ⚡{entry.energy}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Milestones */}
      {milestones.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Trophy className="size-5" /> Recent Milestones Completed
          </h2>
          <div className="space-y-2">
            {milestones.map((ms) => (
              <Card key={ms.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Trophy className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ms.title}</p>
                    <p className="text-xs text-muted-foreground">
                      from {ms.goal.title}
                    </p>
                  </div>
                  {ms.completedAt && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(ms.completedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 &&
        journalEntries.length === 0 &&
        milestones.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <Sparkles className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Nothing here yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your partner hasn&apos;t shared any progress yet. When they log
              journal entries or track goals, you&apos;ll see their activity here.
            </p>
          </div>
        )}
    </div>
  );
}
