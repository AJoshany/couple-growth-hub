"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { getWeeklyDigest } from "@/app/actions/weekly-digest";
import { WeeklyDigestData } from "@/lib/weekly-digest";
import { Calendar, TrendingUp, TrendingDown, Minus, Copy, Share2 } from "lucide-react";

export function WeeklyDigest() {
  const [digest, setDigest] = useState<WeeklyDigestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDigest() {
      try {
        const data = await getWeeklyDigest();
        setDigest(data);
      } catch {
        toast.error("Failed to load weekly digest");
      } finally {
        setLoading(false);
      }
    }
    loadDigest();
  }, []);

  async function handleCopy() {
    if (!digest) return;

    const text = `📅 Weekly Digest (${digest.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${digest.weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })})

📊 Summary:
• Journal Entries: ${digest.summary.journalEntries}
• Goals Progress: ${digest.summary.goalsProgress}%
• Dates Completed: ${digest.summary.datesCompleted}
• Memories Added: ${digest.summary.memoriesAdded}
• Habits Completed: ${digest.summary.habitsCompleted}
• Love Notes: ${digest.summary.loveNotesExchanged}

😊 Mood Trend: ${digest.moodTrend.average}/5 (${digest.moodTrend.trend})`;

    await navigator.clipboard.writeText(text);
    toast.success("Digest copied to clipboard!");
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-4 text-muted-foreground">Loading weekly digest...</p>
        </CardContent>
      </Card>
    );
  }

  if (!digest) return null;

  const TrendIcon = () => {
    if (digest.moodTrend.trend === "improving")
      return <TrendingUp className="size-4 text-green-500" />;
    if (digest.moodTrend.trend === "declining")
      return <TrendingDown className="size-4 text-red-500" />;
    return <Minus className="size-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-4 text-primary" />
            Weekly Digest
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <p className="text-sm text-muted-foreground">
          {digest.weekStart.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}{" "}
          –{" "}
          {digest.weekEnd.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{digest.summary.journalEntries}</p>
            <p className="text-xs text-muted-foreground">Journal Entries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{digest.summary.goalsProgress}%</p>
            <p className="text-xs text-muted-foreground">Goals Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{digest.summary.datesCompleted}</p>
            <p className="text-xs text-muted-foreground">Dates</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{digest.summary.memoriesAdded}</p>
            <p className="text-xs text-muted-foreground">Memories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{digest.summary.habitsCompleted}</p>
            <p className="text-xs text-muted-foreground">Habits Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{digest.summary.loveNotesExchanged}</p>
            <p className="text-xs text-muted-foreground">Love Notes</p>
          </div>
        </div>

        {/* Mood Trend */}
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">😊</span>
            <span className="text-sm font-medium">Mood Average</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{digest.moodTrend.average}/5</span>
            <TrendIcon />
          </div>
        </div>

        {/* Highlights */}
        {digest.highlights.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">✨ Highlights</p>
            <ul className="space-y-1">
              {digest.highlights.map((highlight, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Partner Activity */}
        {digest.partnerActivity.journalEntries > 0 && (
          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-sm font-medium mb-1">💕 Partner Activity</p>
            <p className="text-sm text-muted-foreground">
              {digest.partnerActivity.journalEntries} journal entries •{" "}
              {digest.partnerActivity.goalsProgress}% goals progress
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
