"use client";

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

// Check current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  
  const permission = await Notification.requestPermission();
  return permission;
}

// Send a local notification
export function sendNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }

  new Notification(title, {
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    ...options,
  });
}

// Notification types for the app
export const NOTIFICATION_TYPES = {
  UPCOMING_DATE: "upcoming_date",
  MILESTONE_DUE: "milestone_due",
  PARTNER_ACTIVITY: "partner_activity",
  JOURNAL_REMINDER: "journal_reminder",
} as const;

// Schedule a notification for a specific time
export function scheduleNotification(
  title: string,
  body: string,
  scheduledTime: Date,
  tag?: string
): void {
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay <= 0) {
    // Send immediately if time has passed
    sendNotification(title, { body, tag });
    return;
  }

  // Use setTimeout for delayed notifications
  setTimeout(() => {
    sendNotification(title, { body, tag });
  }, delay);
}

// Format notification messages
export function formatNotificationMessage(
  type: string,
  data: Record<string, unknown>
): { title: string; body: string } {
  switch (type) {
    case NOTIFICATION_TYPES.UPCOMING_DATE:
      return {
        title: "Upcoming Date! 💕",
        body: `You have "${data.title}" on ${new Date(data.date as string).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
      };
    case NOTIFICATION_TYPES.MILESTONE_DUE:
      return {
        title: "Milestone Reminder 🎯",
        body: `Your milestone "${data.title}" is coming up soon!`,
      };
    case NOTIFICATION_TYPES.PARTNER_ACTIVITY:
      return {
        title: "Partner Activity 💝",
        body: data.message as string,
      };
    case NOTIFICATION_TYPES.JOURNAL_REMINDER:
      return {
        title: "Journal Reminder 📝",
        body: "Don't forget to write your journal entry for today!",
      };
    default:
      return {
        title: "Couple Growth Hub",
        body: data.message as string || "You have a new notification",
      };
  }
}
