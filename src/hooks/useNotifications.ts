import { useLocalStorage } from "./useLocalStorage";
import { useCallback, useMemo } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  eventReminders: boolean;
  lowStockAlerts: boolean;
  healthAlerts: boolean;
  competitionReminders: boolean;
  reproductionAlerts: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  eventReminders: true,
  lowStockAlerts: true,
  healthAlerts: true,
  competitionReminders: true,
  reproductionAlerts: true,
};

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(
    "horsecontrol-notifications",
    []
  );
  const [settings, setSettings] = useLocalStorage<NotificationSettings>(
    "horsecontrol-notification-settings",
    defaultSettings
  );

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
      if (!settings.enabled) return;

      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 100));
      return newNotification;
    },
    [settings.enabled, setNotifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [setNotifications]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const deleteNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotifications]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    settings,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
  };
}
