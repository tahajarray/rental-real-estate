"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AppNotification {
  id: string;
  userId: string;
  estateId: string;
  estateTitle: string;
  message: string;
  createdAt: string; // ISO timestamp
  read: boolean;
}

interface NotificationsContextType {
  /** Notifications for the currently logged-in user, newest first. */
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  /** Used by worker/admin dashboards when a booking is approved. */
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const NOTIFICATIONS_KEY = "re_notifications";

function readAll(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function writeAll(next: AppNotification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
}

// Needs the current user's id to filter to "my" notifications — pass null when logged out.
export function NotificationsProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string | null;
}) {
  const [all, setAll] = useState<AppNotification[]>([]);

  useEffect(() => {
    setAll(readAll());
  }, []);

  // Pick up notifications created in another tab (e.g. an admin approving a
  // booking while the user's own tab is open) via the native storage event.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === NOTIFICATIONS_KEY) setAll(readAll());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addNotification: NotificationsContextType["addNotification"] = useCallback((n) => {
    const notification: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const next = [notification, ...readAll()];
    writeAll(next);
    setAll(next);
  }, []);

  const markRead = useCallback((id: string) => {
    const next = readAll().map((n) => (n.id === id ? { ...n, read: true } : n));
    writeAll(next);
    setAll(next);
  }, []);

  const markAllRead = useCallback(() => {
    if (!userId) return;
    const next = readAll().map((n) => (n.userId === userId ? { ...n, read: true } : n));
    writeAll(next);
    setAll(next);
  }, [userId]);

  const notifications = userId
    ? all.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
