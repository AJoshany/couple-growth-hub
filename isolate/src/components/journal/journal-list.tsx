"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Lock, Eye } from "lucide-react";

const moodEmojis: Record<number, string> = {
  1: "😞",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "🤩",
};

interface JournalEntry {
  id: string;
  date: Date;
  summary: string | null;
  mood: number | null;
  energy: number | null;
  productivity: number | null;
  visibility: string;
}

export function JournalList({
  entries,
  today,
}: {
  entries: JournalEntry[];
  today: string;
}) {
  const todayEntry = entries.find(
    (e) => new Date(e.date).toISOString().split("T")[0] === today
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your days and track your well-being
          </p>
        </div>
        <Link href={`/journal/${today}`}>
          <Button>
            <Plus className="size-4" />
            {todayEntry ? "Edit Today" : "Log Today"}
          </Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <BookOpen className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No journal entries yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start logging your days to build a reflective habit.
          </p>
          <Link href={`/journal/${today}`} className="mt-4">
            <Button>Write Today&apos;s Entry</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const dateStr = new Date(entry.date).toISOString().split("T")[0];
            const isToday = dateStr === today;
            const dayName = new Date(entry.date).toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dateFormatted = new Date(entry.date).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            );

            return (
              <Link key={entry.id} href={`/journal/${dateStr}`}>
                <Card
                  className={`transition-colors hover:bg-muted/50 ${
                    isToday ? "ring-2 ring-primary/20" : ""
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {dayName}
                      </span>
                      <span className="text-sm font-bold">{dateFormatted.split(" ")[1]}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {dateFormatted}
                          {isToday && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Today
                            </Badge>
                          )}
                        </p>
                      </div>
                      {entry.summary && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                          {entry.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {entry.mood && (
                        <span className="text-xl" title={`Mood: ${entry.mood}/5`}>
                          {moodEmojis[entry.mood]}
                        </span>
                      )}
                      <div className="flex gap-1 text-xs text-muted-foreground">
                        {entry.energy && (
                          <span title={`Energy: ${entry.energy}/5`}>
                            ⚡{entry.energy}
                          </span>
                        )}
                        {entry.productivity && (
                          <span title={`Productivity: ${entry.productivity}/5`}>
                            🎯{entry.productivity}
                          </span>
                        )}
                      </div>
                      {entry.visibility === "PRIVATE" ? (
                        <Lock className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Eye className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
