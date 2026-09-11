"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { createHabit, getHabits, toggleHabitEntry, deleteHabit } from "@/app/actions/habits";
import { Plus, Trash2, Flame, Trophy, Target } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  entries: Array<{
    id: string;
    date: Date;
    completed: boolean;
  }>;
}

export function HabitsPageClient() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("✅");
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    try {
      const data = await getHabits();
      setHabits(data as Habit[]);
    } catch {
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newHabitName.trim()) return;

    setCreating(true);
    try {
      const result = await createHabit(newHabitName, newHabitIcon);
      if (result?.error) {
        toast.error("Failed to create habit");
      } else {
        toast.success("Habit created!");
        setNewHabitName("");
        setNewHabitIcon("✅");
        setShowAddForm(false);
        await loadHabits();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(habitId: string, date: Date) {
    try {
      await toggleHabitEntry(habitId, date);
      await loadHabits();
    } catch {
      toast.error("Failed to update habit");
    }
  }

  async function handleDelete(habitId: string) {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    try {
      await deleteHabit(habitId);
      toast.success("Habit deleted");
      await loadHabits();
    } catch {
      toast.error("Failed to delete habit");
    }
  }

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Calculate streak for a habit
  function calculateStreak(habit: Habit): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasEntry = habit.entries.some(
        (e) =>
          new Date(e.date).toDateString() === checkDate.toDateString() &&
          e.completed
      );

      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  // Check if habit is completed for a date
  function isCompleted(habit: Habit, date: Date): boolean {
    return habit.entries.some(
      (e) =>
        new Date(e.date).toDateString() === date.toDateString() && e.completed
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <p className="text-muted-foreground">Build positive habits with streaks</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name (e.g., Meditate)"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-3">
                <Input
                  value={newHabitIcon}
                  onChange={(e) => setNewHabitIcon(e.target.value)}
                  placeholder="Icon"
                  className="w-20"
                />
                <Button onClick={handleCreate} disabled={creating} className="flex-1 sm:flex-none">
                  {creating ? <LoadingSpinner size="xs" /> : "Add"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              No habits yet. Start building positive routines!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const streak = calculateStreak(habit);
            return (
              <Card key={habit.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon || "✅"}</span>
                      <div>
                        <p className="font-medium">{habit.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {streak > 0 && (
                            <span className="flex items-center gap-1">
                              <Flame className="size-3 text-orange-500" />
                              {streak} day streak
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(habit.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Week View */}
                  <div className="grid grid-cols-7 gap-1 sm:flex sm:gap-2">
                    {last7Days.map((date, i) => {
                      const completed = isCompleted(habit, date);
                      const isToday =
                        date.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={i}
                          onClick={() => handleToggle(habit.id, date)}
                          className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-colors ${
                            completed
                              ? "bg-green-100 text-green-800"
                              : "bg-muted hover:bg-muted/80"
                          } ${isToday ? "ring-2 ring-primary" : ""}`}
                        >
                          <span className="text-[10px] sm:text-xs font-medium">
                            {date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                          </span>
                          <span className="text-xs sm:text-sm">
                            {date.getDate()}
                          </span>
                          {completed && (
                            <span className="text-green-600 text-xs">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="size-4 text-yellow-500" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{habits.length}</p>
                <p className="text-sm text-muted-foreground">Active Habits</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.max(...habits.map((h) => calculateStreak(h)), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {habits.reduce(
                    (sum, h) =>
                      sum +
                      h.entries.filter(
                        (e) =>
                          e.completed &&
                          new Date(e.date).toDateString() ===
                            new Date().toDateString()
                      ).length,
                    0
                  )}
                  /{habits.length}
                </p>
                <p className="text-sm text-muted-foreground">Done Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
