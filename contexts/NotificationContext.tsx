import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as notifController from "@/controller/notification.app.controller";
import { AppNotification, NotificationType } from "@/types/db";
import { getUserId } from "@/controller/user.controller";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  addNotification: (notif: { type: NotificationType; title: string; message: string; data?: Record<string, any> }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(async () => {
    const uId = await getUserId();
    if (!uId) return;
    const list = await notifController.getNotifications(uId);
    setNotifications(list);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addNotification: NotificationContextType["addNotification"] = async (notif) => {
    const uId = await getUserId();
    if (!uId) return;
    const created = await notifController.addNotification(uId, notif);
    setNotifications(prev => [created, ...prev]);
  };

  const markAsRead = async (id: string) => {
    const uId = await getUserId();
    if (!uId) return;
    await notifController.markAsRead(uId, id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = async () => {
    const uId = await getUserId();
    if (!uId) return;
    await notifController.markAllAsRead(uId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const remove = async (id: string) => {
    const uId = await getUserId();
    if (!uId) return;
    await notifController.deleteNotification(uId, id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const removeAll = async () => {
    const uId = await getUserId();
    if (!uId) return;
    await notifController.deleteAllNotifications(uId);
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, refresh, addNotification, markAsRead, markAllAsRead, remove, removeAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications doit être utilisé dans un NotificationProvider");
  return ctx;
}