"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface JournalEntry {
  date: Date;
  mood: number | null;
  energy: number | null;
  productivity: number | null;
}

interface MoodAnalyticsProps {
  entries?: JournalEntry[];
}

export function MoodAnalytics({ entries = [] }: MoodAnalyticsProps) {
  const [analytics, setAnalytics] = useState<{
    avgMood: number;
    avgEnergy: number;
    avgProductivity: number;
    moodTrend: "up" | "down" | "stable";
    energyTrend: "up" | "down" | "stable";
    bestDay: string;
    worstDay: string;
    weeklyData: Array<{
      day: string;
      mood: number;
      energy: number;
      productivity: number;
    }>;
  } | null>(null);

  useEffect(() => {
    if (entries.length === 0) {
      setAnalytics({
        avgMood: 0,
        avgEnergy: 0,
        avgProductivity: 0,
        moodTrend: "stable",
        energyTrend: "stable",
        bestDay: "No data yet",
        worstDay: "No data yet",
        weeklyData: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
          day,
          mood: 0,
          energy: 0,
          productivity: 0,
        })),
      });
      return;
    }

    // Calculate averages
    const validMoods = entries.filter((e) => e.mood !== null);
    const validEnergy = entries.filter((e) => e.energy !== null);
    const validProductivity = entries.filter((e) => e.productivity !== null);

    const avgMood =
      validMoods.length > 0
        ? validMoods.reduce((sum, e) => sum + (e.mood || 0), 0) /
          validMoods.length
        : 0;
    const avgEnergy =
      validEnergy.length > 0
        ? validEnergy.reduce((sum, e) => sum + (e.energy || 0), 0) /
          validEnergy.length
        : 0;
    const avgProductivity =
      validProductivity.length > 0
        ? validProductivity.reduce((sum, e) => sum + (e.productivity || 0), 0) /
          validProductivity.length
        : 0;

    // Calculate trends (compare last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = entries.filter((e) => {
      const date = new Date(e.date);
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    const prev7Days = entries.filter((e) => {
      const date = new Date(e.date);
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && diffDays <= 14;
    });

    const getTrend = (recent: JournalEntry[], previous: JournalEntry[], key: "mood" | "energy" | "productivity"): "up" | "down" | "stable" => {
      const recentAvg =
        recent.filter((e) => e[key] !== null).length > 0
          ? recent.filter((e) => e[key] !== null).reduce((sum, e) => sum + (e[key] || 0), 0) /
            recent.filter((e) => e[key] !== null).length
          : 0;
      const prevAvg =
        previous.filter((e) => e[key] !== null).length > 0
          ? previous.filter((e) => e[key] !== null).reduce((sum, e) => sum + (e[key] || 0), 0) /
            previous.filter((e) => e[key] !== null).length
          : 0;

      if (recentAvg > prevAvg + 0.3) return "up";
      if (recentAvg < prevAvg - 0.3) return "down";
      return "stable";
    };

    // Find best and worst days
    const dayTotals: Record<string, number> = {};
    entries.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString("en-US", { weekday: "long" });
      const total = (e.mood || 0) + (e.energy || 0) + (e.productivity || 0);
      dayTotals[day] = (dayTotals[day] || 0) + total;
    });

    const bestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "Monday";
    const worstDay = Object.entries(dayTotals).sort((a, b) => a[1] - b[1])[0]?.[0] || "Monday";

    // Weekly data for chart
    const weeklyData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
      const dayEntries = entries.filter((e) => {
        const entryDay = new Date(e.date).toLocaleDateString("en-US", { weekday: "short" });
        return entryDay === day;
      });

      return {
        day,
        mood:
          dayEntries.filter((e) => e.mood !== null).length > 0
            ? dayEntries.filter((e) => e.mood !== null).reduce((sum, e) => sum + (e.mood || 0), 0) /
              dayEntries.filter((e) => e.mood !== null).length
            : 0,
        energy:
          dayEntries.filter((e) => e.energy !== null).length > 0
            ? dayEntries.filter((e) => e.energy !== null).reduce((sum, e) => sum + (e.energy || 0), 0) /
              dayEntries.filter((e) => e.energy !== null).length
            : 0,
        productivity:
          dayEntries.filter((e) => e.productivity !== null).length > 0
            ? dayEntries.filter((e) => e.productivity !== null).reduce(
                (sum, e) => sum + (e.productivity || 0),
                0
              ) / dayEntries.filter((e) => e.productivity !== null).length
            : 0,
      };
    });

    setAnalytics({
      avgMood,
      avgEnergy,
      avgProductivity,
      moodTrend: getTrend(last7Days, prev7Days, "mood"),
      energyTrend: getTrend(last7Days, prev7Days, "energy"),
      bestDay,
      worstDay,
      weeklyData,
    });
  }, [entries]);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const hasData = entries.length > 0;

  const moodEmoji = (value: number) => {
    if (value >= 4) return "😊";
    if (value >= 3) return "🙂";
    if (value >= 2) return "😐";
    return "😔";
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="size-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="size-4 text-red-500" />;
    return <Minus className="size-4 text-muted-foreground" />;
  };

  return (
    <Card>        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-4 text-primary" />
          Mood Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              No journal entries yet. Start writing to see your mood analytics!
            </p>
          </div>
        )}
        {/* Average Scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl">{moodEmoji(analytics.avgMood)}</p>
            <p className="text-sm font-medium">{analytics.avgMood.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-xs text-muted-foreground">Mood</p>
              <TrendIcon trend={analytics.moodTrend} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl">⚡</p>
            <p className="text-sm font-medium">{analytics.avgEnergy.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-xs text-muted-foreground">Energy</p>
              <TrendIcon trend={analytics.energyTrend} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl">🎯</p>
            <p className="text-sm font-medium">{analytics.avgProductivity.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-xs text-muted-foreground">Productivity</p>
              <TrendIcon trend="stable" />
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div>
          <p className="text-sm font-medium mb-3">This Week</p>
          <div className="space-y-2">
            {analytics.weeklyData.map((data) => (
              <div key={data.day} className="flex items-center gap-2">
                <span className="w-8 text-xs text-muted-foreground">{data.day}</span>
                <div className="flex-1 flex gap-1">
                  <div
                    className="h-4 bg-pink-500 rounded"
                    style={{ width: `${(data.mood / 5) * 100}%` }}
                  />
                  <div
                    className="h-4 bg-blue-500 rounded"
                    style={{ width: `${(data.energy / 5) * 100}%` }}
                  />
                  <div
                    className="h-4 bg-green-500 rounded"
                    style={{ width: `${(data.productivity / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-pink-500 rounded" /> Mood
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded" /> Energy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded" /> Productivity
            </span>
          </div>
        </div>

        {/* Insights */}
        <div className="rounded-lg bg-muted p-3 space-y-2">
          <p className="text-sm font-medium">Insights</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              📅 Your best day is <strong>{analytics.bestDay}</strong>
            </li>
            <li>
              📉 Your most challenging day is <strong>{analytics.worstDay}</strong>
            </li>
            {analytics.moodTrend === "up" && (
              <li>📈 Your mood has been improving this week!</li>
            )}
            {analytics.energyTrend === "up" && (
              <li>⚡ Your energy levels are trending up!</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
