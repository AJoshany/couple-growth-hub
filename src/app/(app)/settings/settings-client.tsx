"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { NotificationSettings } from "@/components/notification-settings";
import { ExportSettings } from "@/components/export-settings";
import { toast } from "sonner";
import { generateInvitation } from "@/app/actions/couple";
import { updateRelationshipInfo } from "@/app/actions/relationship";
import { logout } from "@/app/actions/auth";
import { Copy, Check, Users, User, Link, LogOut } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  coupleId: string | null;
  coupleRole: string | null;
};

type Couple = {
  id: string;
  name: string | null;
  startDate: Date | null;
  users: { id: string; name: string; email: string }[];
} | null;

type Invitation = {
  code: string;
  expiresAt: Date;
} | null;

export function SettingsClient({
  user,
  couple,
  pendingInvitation,
}: {
  user: User;
  couple: Couple;
  pendingInvitation: Invitation;
}) {
  const [inviteCode, setInviteCode] = useState(pendingInvitation?.code || "");
  const [coupleName, setCoupleName] = useState(couple?.name || "");
  const [startDate, setStartDate] = useState(
    couple?.startDate ? new Date(couple.startDate).toISOString().split("T")[0] : ""
  );
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGenerateInvite() {
    setLoading(true);
    try {
      const result = await generateInvitation();
      if (result && "code" in result && result.code) {
        setInviteCode(result.code);
        toast.success("Invitation link generated!", {
          description: "Share this link with your partner.",
        });
      } else {
        toast.error("Failed to generate invitation");
      }
    } catch {
      toast.error("Something went wrong generating the invitation.");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/auth/invite/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!", {
      description: "Invitation URL copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveCouple() {
    setLoading(true);
    try {
      await updateRelationshipInfo({
        name: coupleName || undefined,
        startDate: startDate || undefined,
      });
      toast.success("Couple info saved!", {
        description: "Your changes have been updated.",
      });
      router.refresh();
    } catch {
      toast.error("Failed to save couple info.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and couple</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Role</Label>
            <p className="font-medium">
              {user.coupleRole === "OWNER" ? "Couple Creator" : "Member"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Couple */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" /> Couple
          </CardTitle>
          <CardDescription>
            {couple
              ? `You're in a couple with ${couple.users.find((u) => u.id !== user.id)?.name || "your partner"}`
              : "You're not in a couple yet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {couple ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="couple-name">Couple Name</Label>
                  <Input
                    id="couple-name"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    placeholder="e.g. Alex & Sam"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Relationship Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <Button size="sm" onClick={handleSaveCouple} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="xs" /> Saving…
                  </span>
                ) : (
                  "Save Couple Info"
                )}
              </Button>

              <Separator />

              {/* Invitation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Partner Invitation</Label>
                    <p className="text-sm text-muted-foreground">
                      Share this link with your partner to join
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateInvite}
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="xs" />
                    ) : (
                      <Link className="size-4" />
                    )}
                    {inviteCode ? "Regenerate" : "Generate Link"}
                  </Button>
                </div>
                {inviteCode && (
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/invite/${inviteCode}`}
                      className="text-sm"
                    />
                    <Button size="icon" variant="outline" onClick={handleCopyInvite}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Go to the dashboard to create a couple or join with an invitation.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <NotificationSettings />

      {/* Export */}
      <ExportSettings />

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button type="submit" variant="destructive">
              <LogOut className="size-4" /> Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
