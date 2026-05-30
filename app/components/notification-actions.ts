"use server";

import { requireSession } from "@/lib/auth";
import {
  markAllAsRead,
  markNotificationAsRead,
  getNotifications,
  getUnreadCount,
  type Notification,
} from "@/lib/notifications";

export type NotificationSnapshot = {
  notifications: Notification[];
  unreadCount: number;
};

export async function getNotificationSnapshotAction(): Promise<NotificationSnapshot> {
  const session = await requireSession();
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(session.userId),
    getUnreadCount(session.userId),
  ]);

  return { notifications, unreadCount };
}

export async function markAllNotificationsReadAction(): Promise<boolean> {
  const session = await requireSession();
  return markAllAsRead(session.userId);
}

export async function markNotificationReadAction(notificationId: string): Promise<boolean> {
  const session = await requireSession();
  return markNotificationAsRead(session.userId, notificationId);
}
