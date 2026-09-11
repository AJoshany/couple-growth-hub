"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
  scheduleNotification,
  formatNotificationMessage,
  NOTIFICATION_TYPES,
} from "@/lib/notifications";

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("denied");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      return newPermission;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const notify = useCallback(
    (type: string, data: Record<string, unknown>) => {
      if (permission !== "granted") return false;

      const { title, body } = formatNotificationMessage(type, data);
      sendNotification(title, { body, tag: type });
      return true;
    },
    [permission]
  );

  const scheduleNotify = useCallback(
    (
      type: string,
      data: Record<string, unknown>,
      scheduledTime: Date
    ) => {
      if (permission !== "granted") return;

      const { title, body } = formatNotificationMessage(type, data);
      scheduleNotification(title, body, scheduledTime, type);
    },
    [permission]
  );

  return {
    isSupported,
    permission,
    isLoading,
    requestPermission,
    notify,
    scheduleNotify,
    NOTIFICATION_TYPES,
  };
}
