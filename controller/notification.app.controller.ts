import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { AppNotification, NotificationType } from "@/types/db";
import { NOTIFICATION_APP_KEY } from "@/constants/storage";

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const raw = await AsyncStorage.getItem(NOTIFICATION_APP_KEY(userId));
  if (!raw) return [];
  const list: AppNotification[] = JSON.parse(raw);
  return list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function addNotification(
  userId: string,
  notif: {
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
  }
): Promise<AppNotification> {
  const list = await getNotifications(userId);
  const newNotif: AppNotification = {
    id: Crypto.randomUUID(),
    user_id: userId,
    read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...notif,
  };
  const updated = [newNotif, ...list];
  await AsyncStorage.setItem(NOTIFICATION_APP_KEY(userId), JSON.stringify(updated));
  return newNotif;
}

export async function markAsRead(userId: string, id: string) {
  const list = await getNotifications(userId);
  const updated = list.map(n => (n.id === id ? { ...n, read: true } : n));
  await AsyncStorage.setItem(NOTIFICATION_APP_KEY(userId), JSON.stringify(updated));
}

export async function markAllAsRead(userId: string) {
  const list = await getNotifications(userId);
  const updated = list.map(n => ({ ...n, read: true }));
  await AsyncStorage.setItem(NOTIFICATION_APP_KEY(userId), JSON.stringify(updated));
}

export async function deleteNotification(userId: string, id: string) {
  const list = await getNotifications(userId);
  const updated = list.filter(n => n.id !== id);
  await AsyncStorage.setItem(NOTIFICATION_APP_KEY(userId), JSON.stringify(updated));
}

export async function deleteAllNotifications(userId: string) {
  await AsyncStorage.setItem(NOTIFICATION_APP_KEY(userId), JSON.stringify([]));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const list = await getNotifications(userId);
  return list.filter(n => !n.read).length;
}