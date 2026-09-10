"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMemory, updateMemory } from "@/app/actions/memories";

interface MemoryFormProps {
  mode: "create" | "edit";
  dateEvents: { id: string; title: string; date: Date }[];
  memory?: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    date: Date;
    dateEventId: string | null;
  };
}

export function MemoryForm({ mode, dateEvents, memory }: MemoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrors({});

    try {
      if (mode === "create") {
        const result = await createMemory(formData);
        if (result?.error) setErrors(result.error as Record<string, string[]>);
      } else if (memory) {
        const result = await updateMemory(memory.id, formData);
        if (result?.error) {
          setErrors(result.error as Record<string, string[]>);
        } else {
          router.push(`/memories/${memory.id}`);
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
        <CardTitle>{mode === "create" ? "New Memory" : "Edit Memory"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Give this memory a name"
              defaultValue={memory?.title}
              required
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={
                  memory?.date
                    ? new Date(memory.date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                name="location"
                placeholder="Where was this?"
                defaultValue={memory?.location ?? ""}
              />
            </div>
          </div>

          {dateEvents.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="dateEventId">Link to a date (optional)</Label>
              <select
                id="dateEventId"
                name="dateEventId"
                defaultValue={memory?.dateEventId || ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No linked date</option>
                {dateEvents.map((de) => (
                  <option key={de.id} value={de.id}>
                    {de.title} ({new Date(de.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What made this moment special?"
              defaultValue={memory?.description ?? ""}
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Save Memory"
                  : "Save Changes"}
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
