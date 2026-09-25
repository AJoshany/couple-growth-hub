"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GoalCard } from "@/components/goals/goal-card";
import {
  CheckCircle2,
  Layers,
  ListFilter,
  Plus,
  Search,
  Target,
  X,
} from "lucide-react";

type GoalListItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  progress: number;
  targetDate: Date | null;
  milestones: { isCompleted: boolean }[];
};

const CATEGORIES = [
  { value: "CAREER", label: "Career", icon: "💼" },
  { value: "HEALTH", label: "Health", icon: "🏥" },
  { value: "FITNESS", label: "Fitness", icon: "💪" },
  { value: "FINANCE", label: "Finance", icon: "💰" },
  { value: "LEARNING", label: "Learning", icon: "📖" },
  { value: "PERSONAL", label: "Personal", icon: "🌟" },
  { value: "OTHER", label: "Other", icon: "🎯" },
];

const ACTIVE_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "PAUSED"];

const SECTIONS = [
  { key: "active", title: "In Progress", statuses: ACTIVE_STATUSES },
  { key: "completed", title: "Completed", statuses: ["COMPLETED"] },
  { key: "cancelled", title: "Cancelled", statuses: ["CANCELLED"] },
] as const;

type StatusFilter = "all" | "active" | "completed";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

function matchesStatus(status: string, filter: StatusFilter) {
  if (filter === "all") return true;
  if (filter === "completed") return status === "COMPLETED";
  return (ACTIVE_STATUSES as readonly string[]).includes(status);
}

function GoalGrid({
  goals,
  groupByCategory,
}: {
  goals: GoalListItem[];
  groupByCategory: boolean;
}) {
  if (!groupByCategory) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {CATEGORIES.map((category) => {
        const items = goals.filter((goal) => goal.category === category.value);
        if (items.length === 0) return null;
        return (
          <div key={category.value}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <span>{category.icon}</span>
              {category.label}
              <span className="text-muted-foreground">({items.length})</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GoalsListClient({ goals }: { goals: GoalListItem[] }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [groupByCategory, setGroupByCategory] = useState(false);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return goals;
    return goals.filter(
      (goal) =>
        goal.title.toLowerCase().includes(q) ||
        (goal.description ?? "").toLowerCase().includes(q)
    );
  }, [goals, query]);

  const matchesStatusFilter = useMemo(
    () => searched.filter((goal) => matchesStatus(goal.status, statusFilter)),
    [searched, statusFilter]
  );

  const visibleGoals = useMemo(
    () =>
      matchesStatusFilter.filter(
        (goal) => categoryFilter === "all" || goal.category === categoryFilter
      ),
    [matchesStatusFilter, categoryFilter]
  );

  const statusCounts = useMemo(
    () => ({
      all: searched.length,
      active: searched.filter((goal) => matchesStatus(goal.status, "active"))
        .length,
      completed: searched.filter((goal) =>
        matchesStatus(goal.status, "completed")
      ).length,
    }),
    [searched]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const goal of matchesStatusFilter) {
      counts[goal.category] = (counts[goal.category] ?? 0) + 1;
    }
    return counts;
  }, [matchesStatusFilter]);

  const activeCount = goals.filter((goal) => matchesStatus(goal.status, "active"))
    .length;
  const completedCount = goals.filter(
    (goal) => goal.status === "COMPLETED"
  ).length;
  const completedMilestones = goals.reduce(
    (sum, goal) => sum + goal.milestones.filter((m) => m.isCompleted).length,
    0
  );
  const totalMilestones = goals.reduce(
    (sum, goal) => sum + goal.milestones.length,
    0
  );

  const hasFilters =
    query.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }

  const renderedSections = SECTIONS.filter((section) =>
    statusFilter === "all"
      ? true
      : statusFilter === "active"
        ? section.key === "active"
        : section.key === "completed"
  ).map((section) => ({
    ...section,
    items: visibleGoals.filter((goal) =>
      (section.statuses as readonly string[]).includes(goal.status)
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Goals</h1>
          <p className="text-muted-foreground">
            Track your personal growth and achievements
          </p>
        </div>
        <Link href="/goals/new" className="shrink-0 self-start sm:self-auto">
          <Button>
            <Plus className="size-4" />
            New Goal
          </Button>
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Target className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No goals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first goal to start tracking your progress.
          </p>
          <Link href="/goals/new" className="mt-4">
            <Button>Create Goal</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="mt-1 text-2xl font-semibold">{activeCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">
                  {completedCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Milestones</p>
                <p className="mt-1 text-2xl font-semibold">
                  {completedMilestones}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{totalMilestones}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search goals…"
                    className="pl-9 pr-9"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-lg border p-0.5">
                    {STATUS_TABS.map((tab) => (
                      <Button
                        key={tab.value}
                        size="sm"
                        variant={statusFilter === tab.value ? "default" : "ghost"}
                        className="h-7 px-3"
                        onClick={() => setStatusFilter(tab.value)}
                      >
                        {tab.label}
                        <span className="ml-1.5 text-xs opacity-70">
                          {statusCounts[tab.value]}
                        </span>
                      </Button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant={groupByCategory ? "default" : "outline"}
                    className="h-8 gap-1.5"
                    onClick={() => setGroupByCategory((value) => !value)}
                  >
                    <Layers className="size-3.5" />
                    By category
                  </Button>

                  {hasFilters && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1.5"
                      onClick={clearFilters}
                    >
                      <X className="size-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  onClick={() => setCategoryFilter("all")}
                >
                  <ListFilter className="size-3.5" />
                  All categories
                  <span className="ml-1.5 text-xs opacity-70">
                    {matchesStatusFilter.length}
                  </span>
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.value}
                    size="sm"
                    variant={
                      categoryFilter === category.value ? "default" : "outline"
                    }
                    onClick={() => setCategoryFilter(category.value)}
                  >
                    <span>{category.icon}</span>
                    {category.label}
                    <span className="ml-1.5 text-xs opacity-70">
                      {categoryCounts[category.value] ?? 0}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {visibleGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14">
              <Search className="size-10 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No matching goals</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different category or status.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {renderedSections
                .filter((section) => section.items.length > 0)
                .map((section) => (
                  <div key={section.key}>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      {section.key === "completed" ? (
                        <CheckCircle2 className="size-4 text-green-600" />
                      ) : (
                        <Target className="size-4" />
                      )}
                      {section.title} ({section.items.length})
                    </h2>
                    <GoalGrid
                      goals={section.items}
                      groupByCategory={groupByCategory}
                    />
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
