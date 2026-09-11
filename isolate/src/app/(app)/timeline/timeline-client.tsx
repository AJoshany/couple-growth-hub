"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Trophy,
  Calendar,
  CalendarCheck,
  Sparkles,
  BookOpen,
  Heart,
  Users,
  Clock,
} from "lucide-react";

type TimelineEvent = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  date: Date;
  user: { name: string } | null;
};

const eventIcons: Record<string, React.ReactNode> = {
  GOAL_CREATED: <Target className="size-4" />,
  GOAL_COMPLETED: <Trophy className="size-4" />,
  MILESTONE_COMPLETED: <Trophy className="size-4" />,
  SHARED_GOAL_CREATED: <Target className="size-4" />,
  SHARED_GOAL_COMPLETED: <Trophy className="size-4" />,
  SHARED_MILESTONE_COMPLETED: <Trophy className="size-4" />,
  DATE_PLANNED: <Calendar className="size-4" />,
  DATE_COMPLETED: <CalendarCheck className="size-4" />,
  MEMORY_ADDED: <Sparkles className="size-4" />,
  JOURNAL_ENTRY: <BookOpen className="size-4" />,
  RELATIONSHIP_EVENT: <Heart className="size-4" />,
  COUPLE_CREATED: <Users className="size-4" />,
};

const eventColors: Record<string, string> = {
  GOAL_CREATED: "bg-blue-100 text-blue-700",
  GOAL_COMPLETED: "bg-green-100 text-green-700",
  MILESTONE_COMPLETED: "bg-green-100 text-green-700",
  SHARED_GOAL_CREATED: "bg-blue-100 text-blue-700",
  SHARED_GOAL_COMPLETED: "bg-green-100 text-green-700",
  SHARED_MILESTONE_COMPLETED: "bg-green-100 text-green-700",
  DATE_PLANNED: "bg-purple-100 text-purple-700",
  DATE_COMPLETED: "bg-purple-100 text-purple-700",
  MEMORY_ADDED: "bg-pink-100 text-pink-700",
  JOURNAL_ENTRY: "bg-yellow-100 text-yellow-700",
  RELATIONSHIP_EVENT: "bg-red-100 text-red-700",
  COUPLE_CREATED: "bg-primary/10 text-primary",
};

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Clock className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Your story begins here</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            As you use the app, your journey together will appear on this timeline.
          </p>
        </div>
      </div>
    );
  }

  // Group events by month
  const grouped = events.reduce(
    (acc, event) => {
      const key = new Date(event.date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    },
    {} as Record<string, TimelineEvent[]>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timeline</h1>
        <p className="text-muted-foreground">
          Your journey together, moment by moment
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        {Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month} className="mb-8">
            <h2 className="relative mb-4 pl-12 text-sm font-semibold text-muted-foreground">
              <span className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-full border bg-background">
                <Clock className="size-4 text-muted-foreground" />
              </span>
              {month}
            </h2>

            <div className="space-y-3">
              {monthEvents.map((event) => (
                <div key={event.id} className="relative pl-12">
                  {/* Dot on timeline */}
                  <div
                    className={`absolute left-[14px] top-3 flex size-5 items-center justify-center rounded-full ${
                      eventColors[event.type] || "bg-muted"
                    }`}
                  >
                    {eventIcons[event.type] || <Clock className="size-3" />}
                  </div>

                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{event.title}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {event.user && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          by {event.user.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
