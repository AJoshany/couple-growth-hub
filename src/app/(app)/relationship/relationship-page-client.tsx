"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { AnniversaryReminders } from "@/components/anniversary-reminders";
import { toast } from "sonner";
import { getRelationshipInfo, updateRelationshipInfo } from "@/app/actions/relationship";
import { logMissingEntry, getMissingStatus } from "@/app/actions/missing";
import { Heart, Calendar, MapPin, Clock, Users, Sparkles, Edit } from "lucide-react";
import Link from "next/link";

export function RelationshipPageClient() {
  const [info, setInfo] = useState<Awaited<ReturnType<typeof getRelationshipInfo>>>(null);
  const [missing, setMissing] = useState<Awaited<ReturnType<typeof getMissingStatus>>>({ myValue: null, myDate: null, partnerValue: null, partnerDate: null });
  const [myMissingValue, setMyMissingValue] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [i, m] = await Promise.all([getRelationshipInfo(), getMissingStatus()]);
      setInfo(i);
      setMissing(m);
      if (m?.myValue !== null && m.myValue !== undefined) {
        setMyMissingValue(m.myValue);
      }
      if (i?.couple) {
        setCoupleName(i.couple.name || "");
        setStartDate(i.couple.startDate ? new Date(i.couple.startDate).toISOString().split("T")[0] : "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogMissing() {
    setSaving(true);
    try {
      await logMissingEntry(myMissingValue);
      const m = await getMissingStatus();
      setMissing(m);
      toast.success("Missing value updated!", {
        description: `You're missing them at ${myMissingValue}%.`,
      });
    } catch {
      toast.error("Failed to update missing value.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveInfo() {
    setSaving(true);
    try {
      await updateRelationshipInfo({
        name: coupleName || undefined,
        startDate: startDate || undefined,
      });
      const i = await getRelationshipInfo();
      setInfo(i);
      setEditing(false);
      toast.success("Relationship info saved!", {
        description: "Your changes have been updated.",
      });
      router.refresh();
    } catch {
      toast.error("Failed to save relationship info.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Our Relationship</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-3 h-8 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const daysTogether = info?.daysTogether;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="size-6 text-pink-500" />
          <div>
            <h1 className="text-2xl font-bold">
              {info?.couple?.name || "Our Relationship"}
            </h1>
            <p className="text-muted-foreground">
              {info?.partner ? `Together with ${info.partner.name}` : "Your journey"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          <Edit className="size-4" />
          Edit
        </Button>
      </div>

      {editing && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Couple Name</label>
                <input
                  type="text"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  placeholder="e.g. Alex & Sam"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Relationship Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveInfo} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="xs" /> Saving…
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">{daysTogether ?? "—"}</p>
            <p className="text-sm text-muted-foreground">Days Together</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">{info?.totalDates ?? 0}</p>
            <p className="text-sm text-muted-foreground">Dates Together</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">{info?.totalMemories ?? 0}</p>
            <p className="text-sm text-muted-foreground">Memories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">
              {info?.couple?.startDate
                ? new Date(info.couple.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "—"}
            </p>
            <p className="text-sm text-muted-foreground">Started</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Date */}
      {info?.nextDate && (
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Next Date</p>
              <p className="font-semibold">{info.nextDate.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(info.nextDate.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                {info.nextDate.location && ` · ${info.nextDate.location}`}
              </p>
            </div>
            <Link href={`/dates/${info.nextDate.id}`}>
              <Button variant="outline" size="sm">View</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Last Date */}
      {info?.lastDate && (
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Heart className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Last Date</p>
              <p className="font-semibold">{info.lastDate.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(info.lastDate.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Each Other */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missing Each Other</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* My Value */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">How much I miss you</p>
                <span className="text-2xl font-bold">{myMissingValue}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={myMissingValue}
                onChange={(e) => setMyMissingValue(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not much</span>
                <span>So much</span>
              </div>
              <Button size="sm" onClick={handleLogMissing} disabled={saving} className="w-full">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="xs" /> Updating…
                  </span>
                ) : (
                  "Update"
                )}
              </Button>
            </div>

            {/* Partner's Value */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">How much they miss me</p>
                <span className="text-2xl font-bold">
                  {missing?.partnerValue !== null && missing?.partnerValue !== undefined
                    ? `${missing.partnerValue}%`
                    : "—"}
                </span>
              </div>
              <Progress
                value={missing?.partnerValue ?? 0}
                className="h-3"
              />
              {missing?.partnerDate && (
                <p className="text-xs text-muted-foreground text-center">
                  Updated {new Date(missing.partnerDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anniversary Reminders */}
      <AnniversaryReminders
        startDate={info?.couple?.startDate || null}
        firstDate={info?.lastDate?.date || null}
        firstMemory={null}
      />

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/dates">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="size-5 text-primary" />
              <div>
                <p className="font-medium">Our Dates</p>
                <p className="text-sm text-muted-foreground">Plan and view dates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/memories">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 p-4">
              <Sparkles className="size-5 text-primary" />
              <div>
                <p className="font-medium">Our Memories</p>
                <p className="text-sm text-muted-foreground">Cherished moments</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
