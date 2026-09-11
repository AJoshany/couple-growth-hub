"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, BellOff, Check } from "lucide-react";
import { toast } from "sonner";

export function NotificationSettings() {
  const { isSupported, permission, isLoading, requestPermission } = useNotifications();
  const [requested, setRequested] = useState(false);

  const handleEnable = async () => {
    const result = await requestPermission();
    setRequested(true);

    if (result === "granted") {
      toast.success("Notifications enabled!", {
        description: "You'll receive reminders for dates, milestones, and more.",
      });
    } else {
      toast.error("Notifications blocked", {
        description: "Please enable notifications in your browser settings.",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellOff className="size-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notifications are not supported in your browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4" /> Notifications
        </CardTitle>
        <CardDescription>
          Get reminders for upcoming dates, milestones, and partner activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "granted" ? (
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="size-5" />
            </div>
            <div>
              <p className="font-medium text-green-600">Notifications Enabled</p>
              <p className="text-sm text-muted-foreground">
                You'll receive reminders for important events
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enable notifications to stay updated on:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-pink-500">💕</span> Upcoming dates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">🎯</span> Milestone reminders
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">💝</span> Partner activity
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">📝</span> Journal reminders
              </li>
            </ul>
            <Button
              onClick={handleEnable}
              disabled={isLoading || requested}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="xs" /> Enabling...
                </span>
              ) : requested ? (
                <span className="flex items-center gap-2">
                  <Check className="size-4" /> Enabled
                </span>
              ) : (
                <>
                  <Bell className="size-4" /> Enable Notifications
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
