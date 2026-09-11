"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { createDateEvent, updateDateEvent } from "@/app/actions/dates";

const dateTypes = [
  "Dinner",
  "Lunch",
  "Coffee",
  "Movie",
  "Outdoor",
  "Adventure",
  "Stay In",
  "Surprise",
  "Other",
];

interface DateEventFormProps {
  mode: "create" | "edit";
  event?: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    date: Date;
    type: string | null;
    notes: string | null;
  };
}

export function DateEventForm({ mode, event }: DateEventFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrors({});

    try {
      if (mode === "create") {
        const result = await createDateEvent(formData);
        if (result?.error) {
          setErrors(result.error as Record<string, string[]>);
        } else {
          toast.success("Date planned!", {
            description: "Your date has been added to the calendar.",
          });
          router.push("/dates");
          router.refresh();
        }
      } else if (event) {
        const result = await updateDateEvent(event.id, formData);
        if (result?.error) {
          setErrors(result.error as Record<string, string[]>);
        } else {
          toast.success("Date updated!", {
            description: "Your changes have been saved.",
          });
          router.push(`/dates/${event.id}`);
          router.refresh();
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") {
        router.refresh();
        return;
      }
      setErrors({ title: ["An unexpected error occurred"] });
        toast.error("Failed to save date");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Plan a Date" : "Edit Date"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="What's the plan?"
              defaultValue={event?.title}
              required
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={
                  event?.date
                    ? new Date(event.date).toISOString().slice(0, 16)
                    : ""
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={event?.type || ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select type</option>
                {dateTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              name="location"
              placeholder="Where?"
              defaultValue={event?.location ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Details about the date..."
              defaultValue={event?.description ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special notes or ideas..."
              defaultValue={event?.notes ?? ""}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="xs" /> Saving…
                </span>
              ) : mode === "create"
                  ? "Plan Date"
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
