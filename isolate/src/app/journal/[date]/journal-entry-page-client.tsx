"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { addActivity, toggleActivity, deleteActivity } from "@/app/actions/journal";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";
import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  goalId: string | null;
};

type Log = {
  id: string;
  activities: Activity[];
};

type Goal = {
  id: string;
  title: string;
};

interface JournalEntryPageClientProps {
  date: string;
  entry: {
    summary: string | null;
    accomplishments: string | null;
    learned: string | null;
    difficult: string | null;
    tomorrow: string | null;
    mood: number | null;
    energy: number | null;
    productivity: number | null;
    visibility: string;
  } | null;
  log: Log;
  goals: Goal[];
}

export function JournalEntryPageClient({
  date,
  entry,
  log,
  goals,
}: JournalEntryPageClientProps) {
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [activityGoalId, setActivityGoalId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dateDisplay = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const completedActivities = log.activities.filter((a) => a.isCompleted).length;

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activityTitle.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("title", activityTitle);
    if (activityDesc) formData.set("description", activityDesc);
    if (activityGoalId) formData.set("goalId", activityGoalId);
    await addActivity(log.id, formData);
    setActivityTitle("");
    setActivityDesc("");
    setActivityGoalId("");
    setLoading(false);
    router.refresh();
  }

  async function handleToggleActivity(id: string) {
    await toggleActivity(id);
    router.refresh();
  }

  async function handleDeleteActivity(id: string) {
    await deleteActivity(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/journal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{dateDisplay}</h1>
          <p className="text-muted-foreground">
            {entry ? "Edit your journal entry" : "How was your day?"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Journal Entry Form */}
        <div className="lg:col-span-2">
          <JournalEntryForm date={date} entry={entry} />
        </div>

        {/* Activities Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Activities
                {log.activities.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {completedActivities}/{log.activities.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {log.activities.length > 0 ? (
                <div className="space-y-2">
                  {log.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-2 rounded-lg border p-2"
                    >
                      <button
                        onClick={() => handleToggleActivity(activity.id)}
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          activity.isCompleted
                            ? "bg-green-500 text-white border-green-500"
                            : "border-muted-foreground/30 hover:border-muted-foreground"
                        }`}
                      >
                        {activity.isCompleted && <Check className="size-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            activity.isCompleted
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {activity.title}
                        </p>
                        {activity.goalId && (
                          <p className="text-xs text-muted-foreground">
                            📎 Linked to goal
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activities logged yet
                </p>
              )}

              <Separator />

              <form onSubmit={handleAddActivity} className="space-y-2">
                <Input
                  placeholder="What did you do?"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  required
                />
                <Input
                  placeholder="Notes (optional)"
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                />
                {goals.length > 0 && (
                  <select
                    value={activityGoalId}
                    onChange={(e) => setActivityGoalId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">No goal linked</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                )}
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  <Plus className="size-4" />
                  Add Activity
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
