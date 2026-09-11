"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getWeeklyReview } from "@/app/actions/weekly";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Calendar,
  Sparkles,
  Heart,
  TrendingUp,
  Activity,
} from "lucide-react";

type WeeklyData = Awaited<ReturnType<typeof getWeeklyReview>>;

const moodEmojis: Record<number, string> = {
  1: "😞",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "🤩",
};

export function WeeklyReviewClient() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const d = await getWeeklyReview(weekOffset);
      setData(d);
      setLoading(false);
    }
    load();
  }, [weekOffset]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Weekly Review</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-3 h-8 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const weekLabel =
    weekOffset === 0
      ? "This Week"
      : weekOffset === -1
        ? "Last Week"
        : `${new Date(data.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(data.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Review</h1>
          <p className="text-muted-foreground">Reflect on your week together</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex-1 text-center text-sm font-medium sm:min-w-[140px] sm:flex-none">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset >= 0}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">{data.journal.entries}/7</p>
            <p className="text-sm text-muted-foreground">Journal Days</p>
            <Progress value={data.journal.completion} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">
              {data.activities.completed}/{data.activities.total}
            </p>
            <p className="text-sm text-muted-foreground">Activities Done</p>
            <Progress value={data.activities.completion} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">{data.dates.count}</p>
            <p className="text-sm text-muted-foreground">Dates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">{data.memories}</p>
            <p className="text-sm text-muted-foreground">Memories</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood / Energy / Productivity Chart */}
      {data.journal.dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4" />
              Daily Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.journal.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="mood" name="Mood" fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="energy" name="Energy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="productivity" name="Productivity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Averages */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Avg Mood</p>
            <p className="mt-1 text-3xl font-bold">
              {data.journal.avgMood > 0
                ? `${moodEmojis[Math.round(data.journal.avgMood)]} ${data.journal.avgMood}`
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Avg Energy</p>
            <p className="mt-1 text-3xl font-bold">
              {data.journal.avgEnergy > 0 ? `⚡ ${data.journal.avgEnergy}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Avg Productivity</p>
            <p className="mt-1 text-3xl font-bold">
              {data.journal.avgProductivity > 0 ? `🎯 ${data.journal.avgProductivity}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      {(data.goals.individual.length > 0 || data.goals.shared.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="size-4" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.goals.individual.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Individual</p>
                <div className="space-y-2">
                  {data.goals.individual.map((g) => (
                    <div key={g.id} className="flex items-center gap-3">
                      <span className="flex-1 text-sm truncate">{g.title}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">{g.progress}%</span>
                      <Progress value={g.progress} className="h-2 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.goals.shared.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Shared</p>
                <div className="space-y-2">
                  {data.goals.shared.map((g) => (
                    <div key={g.id} className="flex items-center gap-3">
                      <span className="flex-1 text-sm truncate">{g.title}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">{g.progress}%</span>
                      <Progress value={g.progress} className="h-2 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Missing Each Other Trend */}
      {(data.missing.mine.length > 0 || data.missing.partner.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="size-4" />
              Missing Each Other
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {data.missing.mine.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Me"
                    data={data.missing.mine.map((e) => ({
                      day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
                      value: e.value,
                    }))}
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
                {data.missing.partner.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Partner"
                    data={data.missing.partner.map((e) => ({
                      day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
                      value: e.value,
                    }))}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Dates This Week */}
      {data.dates.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="size-4" />
              Dates This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.dates.items.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{d.title}</span>
                  <Badge variant={d.isCompleted ? "default" : "secondary"}>
                    {d.isCompleted ? "Done" : "Planned"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.journal.entries === 0 &&
        data.activities.total === 0 &&
        data.dates.count === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <BookOpen className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No data this week</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start logging journal entries and activities to see your weekly review.
            </p>
          </div>
        )}
    </div>
  );
}
