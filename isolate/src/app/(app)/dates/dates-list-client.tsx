"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, MapPin, Check } from "lucide-react";

type DateEvent = {
  id: string;
  title: string;
  date: Date;
  location: string | null;
  type: string | null;
  isCompleted: boolean;
  planner: { name: string };
};

export function DatesListClient({ events }: { events: DateEvent[] }) {
  const upcoming = events.filter((e) => !e.isCompleted);
  const past = events.filter((e) => e.isCompleted);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dates</h1>
          <p className="text-muted-foreground">
            Plan and cherish your time together
          </p>
        </div>
        <Link href="/dates/new" className="shrink-0 self-start sm:self-auto">
          <Button>
            <Plus className="size-4" />
            Plan Date
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Calendar className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No dates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan your first date together.
          </p>
          <Link href="/dates/new" className="mt-4">
            <Button>Plan a Date</Button>
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-2">
                {upcoming.map((event) => (
                  <Link key={event.id} href={`/dates/${event.id}`}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardContent className="flex items-center gap-3 p-4 sm:gap-4">
                        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-center">
                          <span className="text-xs font-medium text-primary">
                            {new Date(event.date).toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                            {event.location && (
                              <span className="ml-2 inline-flex items-center gap-1">
                                <MapPin className="size-3" />
                                {event.location}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {event.type && (
                            <Badge variant="outline" className="hidden sm:inline-flex">
                              {event.type}
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {Math.ceil(
                              (new Date(event.date).getTime() - Date.now()) /
                                (1000 * 60 * 60 * 24)
                            )}d
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Past Dates ({past.length})
              </h2>
              <div className="space-y-2">
                {past.slice(0, 10).map((event) => (
                  <Link key={event.id} href={`/dates/${event.id}`}>
                    <Card className="transition-colors hover:bg-muted/50 opacity-75">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <Check className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
