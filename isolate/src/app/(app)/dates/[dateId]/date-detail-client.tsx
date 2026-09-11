"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DateEventForm } from "@/components/dates/date-event-form";
import { completeDateEvent, deleteDateEvent } from "@/app/actions/dates";
import { ArrowLeft, Check, Trash2, MapPin, Calendar, Clock, Edit } from "lucide-react";
import Link from "next/link";

type DateEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: Date;
  type: string | null;
  notes: string | null;
  isCompleted: boolean;
  planner: { name: string };
  memories: { id: string; title: string }[];
};

export function DateDetailClient({ event }: { event: DateEvent }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dateDisplay = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeDisplay = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  async function handleComplete() {
    setLoading(true);
    await completeDateEvent(event.id);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this date?")) return;
    await deleteDateEvent(event.id);
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setEditing(false)}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <DateEventForm mode="edit" event={event} />
      </div>
    );
  }

  const countdown = Math.ceil(
    (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link href="/dates" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold break-words">{event.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {event.isCompleted ? (
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800">
                  {countdown > 0 ? `In ${countdown} days` : "Today!"}
                </Badge>
              )}
              {event.type && <Badge variant="outline">{event.type}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {!event.isCompleted && (
            <Button onClick={handleComplete} disabled={loading}>
              <Check className="size-4" /> Mark Done
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="size-4" /> Edit
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{dateDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm">{timeDisplay}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm">{event.location}</span>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Planned by {event.planner.name}
          </div>

          {event.description && (
            <>
              <Separator />
              <p className="text-sm">{event.description}</p>
            </>
          )}

          {event.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{event.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {event.memories.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Memories from this date</h2>
          <div className="space-y-2">
            {event.memories.map((memory) => (
              <Link key={memory.id} href={`/memories/${memory.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <p className="font-medium">{memory.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
