"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { FileUpload } from "@/components/ui/file-upload";
import { ReflectionPrompts } from "@/components/reflection-prompts";
import { toast } from "sonner";
import { upsertJournalEntry } from "@/app/actions/journal";

interface JournalEntryFormProps {
  date: string;
  entry?: {
    summary: string | null;
    accomplishments: string | null;
    learned: string | null;
    difficult: string | null;
    tomorrow: string | null;
    mood: number | null;
    energy: number | null;
    productivity: number | null;
    visibility: string;
    imageUrl?: string | null;
  } | null;
}

const moodEmojis = ["", "😞", "😐", "🙂", "😊", "🤩"];
const moodLabels = ["", "Rough", "Meh", "Okay", "Good", "Great"];
const energyLabels = ["", "Exhausted", "Low", "Moderate", "High", "Peak"];
const productivityLabels = ["", "Unproductive", "Low", "Average", "Productive", "Crushing it"];

function RatingSlider({
  name,
  label,
  value,
  onChange,
  labels,
  emojis,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  labels: string[];
  emojis?: string[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {emojis && value > 0 ? emojis[value] : ""} {labels[value] || "Not set"}
        </span>
      </div>
      <input type="hidden" name={name} value={value || ""} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              value === v
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {emojis ? emojis[v] : v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function JournalEntryForm({ date, entry }: JournalEntryFormProps) {
  const [mood, setMood] = useState(entry?.mood || 0);
  const [energy, setEnergy] = useState(entry?.energy || 0);
  const [productivity, setProductivity] = useState(entry?.productivity || 0);
  const [visibility, setVisibility] = useState(entry?.visibility || "PARTNER_VISIBLE");
  const [imageUrl, setImageUrl] = useState<string | null>(entry?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    formData.set("date", date);
    formData.set("mood", String(mood));
    formData.set("energy", String(energy));
    formData.set("productivity", String(productivity));
    formData.set("visibility", visibility);

    setLoading(true);
    setErrors({});

    try {
      const result = await upsertJournalEntry(formData);
      if (result?.error) {
        setErrors(result.error as Record<string, string[]>);
      } else {
        toast.success("Journal entry saved!", {
          description: "Your reflection has been recorded.",
        });
        router.push("/journal");
        router.refresh();
      }
    } catch (e) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") {
        router.refresh();
        return;
      }
      setErrors({ summary: ["An unexpected error occurred"] });
        toast.error("Failed to save journal entry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Mood, Energy, Productivity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RatingSlider
            name="mood"
            label="Mood"
            value={mood}
            onChange={setMood}
            labels={moodLabels}
            emojis={moodEmojis}
          />
          <RatingSlider
            name="energy"
            label="Energy"
            value={energy}
            onChange={setEnergy}
            labels={energyLabels}
          />
          <RatingSlider
            name="productivity"
            label="Productivity"
            value={productivity}
            onChange={setProductivity}
            labels={productivityLabels}
          />
        </CardContent>
      </Card>

      {/* Journal Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reflect on your day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              placeholder="How was your day in a nutshell?"
              defaultValue={entry?.summary ?? ""}
              rows={2}
            />
          </div>

          {/* Reflection Prompt Suggestion */}
          {!entry && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-2">Need inspiration? Try this prompt:</p>
              <ReflectionPrompts
                onSelectPrompt={(prompt) => {
                  const summaryField = document.getElementById("summary") as HTMLTextAreaElement;
                  if (summaryField) {
                    summaryField.value = prompt;
                    summaryField.focus();
                  }
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="accomplishments">What I accomplished</Label>
            <Textarea
              id="accomplishments"
              name="accomplishments"
              placeholder="What did you get done today?"
              defaultValue={entry?.accomplishments ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learned">What I learned</Label>
            <Textarea
              id="learned"
              name="learned"
              placeholder="Any insights or lessons from today?"
              defaultValue={entry?.learned ?? ""}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficult">What was difficult</Label>
            <Textarea
              id="difficult"
              name="difficult"
              placeholder="What challenges did you face?"
              defaultValue={entry?.difficult ?? ""}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tomorrow">What I want to do tomorrow</Label>
            <Textarea
              id="tomorrow"
              name="tomorrow"
              placeholder="What are your intentions for tomorrow?"
              defaultValue={entry?.tomorrow ?? ""}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            value={imageUrl || undefined}
            onChange={setImageUrl}
          />
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Visibility</Label>
              <p className="text-sm text-muted-foreground">
                {visibility === "PARTNER_VISIBLE"
                  ? "Your partner can see this entry"
                  : "Only you can see this entry"}
              </p>
            </div>
            <Button
              type="button"
              variant={visibility === "PARTNER_VISIBLE" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setVisibility(
                  visibility === "PARTNER_VISIBLE" ? "PRIVATE" : "PARTNER_VISIBLE"
                )
              }
            >
              {visibility === "PARTNER_VISIBLE" ? "🤝 Visible" : "🔒 Private"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {errors.summary && (
        <p className="text-sm text-destructive">{errors.summary[0]}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="xs" /> Saving…
            </span>
          ) : entry ? "Update Entry" : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}
