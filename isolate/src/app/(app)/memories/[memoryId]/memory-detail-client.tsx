"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemoryForm } from "@/components/memories/memory-form";
import { deleteMemory } from "@/app/actions/memories";
import { ArrowLeft, Trash2, MapPin, Calendar, User, Edit } from "lucide-react";
import Link from "next/link";

type Memory = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: Date;
  dateEventId: string | null;
  creator: { name: string } | null;
  dateEvent: { id: string; title: string; date: Date } | null;
};

export function MemoryDetailClient({ memory }: { memory: Memory }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this memory?")) return;
    await deleteMemory(memory.id);
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setEditing(false)}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <MemoryForm
          mode="edit"
          dateEvents={[]}
          memory={memory}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link href="/memories" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold break-words">{memory.title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
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
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {new Date(memory.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {memory.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {memory.location}
              </div>
            )}
            {memory.creator && (
              <div className="flex items-center gap-1.5">
                <User className="size-4" />
                Saved by {memory.creator.name}
              </div>
            )}
          </div>

          {memory.description && (
            <>
              <Separator />
              <p className="text-sm leading-relaxed">{memory.description}</p>
            </>
          )}

          {memory.dateEvent && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <Badge variant="outline">📅 Linked Date</Badge>
                <Link
                  href={`/dates/${memory.dateEvent.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {memory.dateEvent.title}
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
