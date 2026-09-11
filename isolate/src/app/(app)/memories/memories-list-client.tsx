"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, MapPin, Calendar } from "lucide-react";

type Memory = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: Date;
  creator: { name: string } | null;
  dateEvent: { title: string } | null;
};

export function MemoriesListClient({ memories }: { memories: Memory[] }) {
  // Group by year
  const grouped = memories.reduce(
    (acc, memory) => {
      const year = new Date(memory.date).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(memory);
      return acc;
    },
    {} as Record<string, Memory[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Memories</h1>
          <p className="text-muted-foreground">
            Cherished moments from your journey together
          </p>
        </div>
        <Link href="/memories/new">
          <Button>
            <Plus className="size-4" />
            Add Memory
          </Button>
        </Link>
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Sparkles className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No memories yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your first cherished moment together.
          </p>
          <Link href="/memories/new" className="mt-4">
            <Button>Add Memory</Button>
          </Link>
        </div>
      ) : (
        Object.entries(grouped).map(([year, yearMemories]) => (
          <div key={year}>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">{year}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {yearMemories.map((memory) => (
                <Link key={memory.id} href={`/memories/${memory.id}`}>
                  <Card className="transition-colors hover:bg-muted/50 h-full">
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-medium">{memory.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {new Date(memory.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      {memory.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="size-3.5" />
                          {memory.location}
                        </div>
                      )}
                      {memory.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {memory.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        {memory.creator && (
                          <Badge variant="secondary" className="text-xs">
                            by {memory.creator.name}
                          </Badge>
                        )}
                        {memory.dateEvent && (
                          <Badge variant="outline" className="text-xs">
                            📅 {memory.dateEvent.title}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
