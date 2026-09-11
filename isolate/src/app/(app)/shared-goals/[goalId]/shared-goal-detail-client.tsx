"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SharedGoalForm } from "@/components/shared-goals/shared-goal-form";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  updateSharedGoalProgress,
  addSharedMilestone,
  toggleSharedMilestone,
  deleteSharedMilestone,
  deleteSharedGoal,
} from "@/app/actions/shared-goals";
import { ArrowLeft, Check, Trash2, Plus, Users } from "lucide-react";
import Link from "next/link";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  progress: number;
  startDate: Date | null;
  targetDate: Date | null;
  milestones: {
    id: string;
    title: string;
    description: string | null;
    isCompleted: boolean;
    completedAt: Date | null;
  }[];
};

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function SharedGoalDetailClient({ goal }: { goal: Goal }) {
  const [editing, setEditing] = useState(false);
  const [progressValue, setProgressValue] = useState(goal.progress);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
  const totalMilestones = goal.milestones.length;

  async function handleProgressUpdate() {
    setLoading(true);
    await updateSharedGoalProgress(goal.id, {
      progress: progressValue,
      status: progressValue === 100 ? "COMPLETED" : undefined,
    });
    setLoading(false);
    router.refresh();
  }

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;
    setLoading(true);
    await addSharedMilestone(goal.id, new FormData(e.currentTarget as HTMLFormElement));
    setMilestoneTitle("");
    setMilestoneDesc("");
    setLoading(false);
    router.refresh();
  }

  async function handleToggleMilestone(id: string) {
    await toggleSharedMilestone(id);
    router.refresh();
  }

  async function handleDeleteMilestone(id: string) {
    await deleteSharedMilestone(id);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this shared goal?")) return;
    await deleteSharedGoal(goal.id);
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setEditing(false)}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <SharedGoalForm mode="edit" goal={goal} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link href="/shared-goals" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold break-words">
              <Users className="size-5 shrink-0 text-primary" />
              {goal.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={statusColors[goal.status] || ""}>
                {goal.status.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline">{goal.category}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {goal.description && <p className="text-muted-foreground">{goal.description}</p>}

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={progressValue} className="h-3 flex-1" />
            <span className="text-lg font-semibold w-12 text-right">{progressValue}%</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0} max={100} step={5}
              value={progressValue}
              onChange={(e) => setProgressValue(Number(e.target.value))}
              className="flex-1"
            />
            <Button size="sm" onClick={handleProgressUpdate} disabled={loading || progressValue === goal.progress}>
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <LoadingSpinner size="xs" /> Updating…
                </span>
              ) : (
                "Update"
              )}
            </Button>
          </div>
          {totalMilestones > 0 && (
            <p className="text-sm text-muted-foreground">
              {completedMilestones} of {totalMilestones} milestones completed
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {goal.startDate && <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>}
            {goal.targetDate && <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.milestones.length > 0 ? (
            <div className="space-y-2">
              {goal.milestones.map((ms) => (
                <div key={ms.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <button
                    onClick={() => handleToggleMilestone(ms.id)}
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                      ms.isCompleted
                        ? "bg-green-500 text-white border-green-500"
                        : "border-muted-foreground/30 hover:border-muted-foreground"
                    }`}
                  >
                    {ms.isCompleted && <Check className="size-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${ms.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {ms.title}
                    </p>
                    {ms.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{ms.description}</p>
                    )}
                  </div>
                  <button onClick={() => handleDeleteMilestone(ms.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No milestones yet</p>
          )}

          <Separator />

          <form onSubmit={handleAddMilestone} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Input name="title" placeholder="Milestone title" value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)} className="flex-1" required />
              <Button type="submit" size="sm" disabled={loading}>
                <Plus className="size-4" /> Add
              </Button>
            </div>
            <Input name="description" placeholder="Description (optional)" value={milestoneDesc}
              onChange={(e) => setMilestoneDesc(e.target.value)} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
