"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSharedGoal, updateSharedGoal } from "@/app/actions/shared-goals";

const categories = [
  { value: "CAREER", label: "Career" },
  { value: "HEALTH", label: "Health" },
  { value: "FITNESS", label: "Fitness" },
  { value: "FINANCE", label: "Finance" },
  { value: "LEARNING", label: "Learning" },
  { value: "PERSONAL", label: "Personal" },
  { value: "OTHER", label: "Other" },
];

const statuses = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAUSED", label: "Paused" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface SharedGoalFormProps {
  mode: "create" | "edit";
  goal?: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    status: string;
    progress: number;
    startDate: Date | null;
    targetDate: Date | null;
  };
}

export function SharedGoalForm({ mode, goal }: SharedGoalFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrors({});

    try {
      if (mode === "create") {
        const result = await createSharedGoal(formData);
        if (result?.error) setErrors(result.error as Record<string, string[]>);
      } else if (goal) {
        const result = await updateSharedGoal(goal.id, formData);
        if (result?.error) {
          setErrors(result.error as Record<string, string[]>);
        } else {
          router.push(`/shared-goals/${goal.id}`);
          router.refresh();
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") {
        router.refresh();
        return;
      }
      setErrors({ title: ["An unexpected error occurred"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New Shared Goal" : "Edit Shared Goal"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="What do you want to achieve together?"
              defaultValue={goal?.title}
              required
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Why is this important to both of you?"
              defaultValue={goal?.description ?? ""}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" defaultValue={goal?.category || "PERSONAL"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mode === "edit" && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={goal?.status || "NOT_STARTED"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  goal?.startDate
                    ? new Date(goal.startDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (optional)</Label>
              <Input
                id="targetDate"
                name="targetDate"
                type="date"
                defaultValue={
                  goal?.targetDate
                    ? new Date(goal.targetDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create Goal" : "Save Changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
