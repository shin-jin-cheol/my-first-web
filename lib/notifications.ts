import { SUPABASE_NOTIFICATIONS_TABLE, SUPABASE_URL } from "@/lib/env";
import { requestSupabaseHttp } from "@/lib/supabase/http";
import { hasSupabaseStorage } from "@/lib/storage";

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

function getSupabaseNotificationsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_NOTIFICATIONS_TABLE}`;
  return `${base}${query}`;
}

async function requestNotifications<T>(
  method: "GET" | "POST" | "PATCH",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabaseNotificationsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

function normalizeUserId(userId: string) {
  return userId.trim();
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string,
): Promise<Notification | undefined> {
  if (!hasSupabaseStorage()) {
    return undefined;
  }

  const normalizedUserId = normalizeUserId(userId);
  const normalizedType = type.trim();
  const normalizedTitle = title.trim();
  const normalizedBody = body.trim();
  const normalizedLink = link?.trim() || null;

  if (!normalizedUserId || !normalizedType || !normalizedTitle || !normalizedBody) {
    return undefined;
  }

  const result = await requestNotifications<Notification[]>(
    "POST",
    "",
    [
      {
        user_id: normalizedUserId,
        type: normalizedType,
        title: normalizedTitle,
        body: normalizedBody,
        link: normalizedLink,
      },
    ],
    "return=representation",
  );

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return undefined;
  }

  return result.data[0];
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!hasSupabaseStorage()) {
    return [];
  }

  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    return [];
  }

  const result = await requestNotifications<Notification[]>(
    "GET",
    `?select=id,user_id,type,title,body,link,is_read,created_at&user_id=eq.${encodeURIComponent(normalizedUserId)}&order=created_at.desc&limit=20`,
  );

  if (!result.ok || !Array.isArray(result.data)) {
    return [];
  }

  return result.data;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  if (!hasSupabaseStorage()) {
    return false;
  }

  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    return false;
  }

  const result = await requestNotifications<Notification[]>(
    "PATCH",
    `?user_id=eq.${encodeURIComponent(normalizedUserId)}&is_read=eq.false&select=id`,
    { is_read: true },
    "return=representation",
  );

  return result.ok;
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
  if (!hasSupabaseStorage()) {
    return false;
  }

  const normalizedUserId = normalizeUserId(userId);
  const normalizedNotificationId = notificationId.trim();
  if (!normalizedUserId || !normalizedNotificationId) {
    return false;
  }

  const result = await requestNotifications<Notification[]>(
    "PATCH",
    `?id=eq.${encodeURIComponent(normalizedNotificationId)}&user_id=eq.${encodeURIComponent(normalizedUserId)}&select=id`,
    { is_read: true },
    "return=representation",
  );

  return Boolean(result.ok && Array.isArray(result.data) && result.data.length > 0);
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!hasSupabaseStorage()) {
    return 0;
  }

  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    return 0;
  }

  const result = await requestNotifications<Array<Pick<Notification, "id">>>(
    "GET",
    `?select=id&user_id=eq.${encodeURIComponent(normalizedUserId)}&is_read=eq.false`,
  );

  if (!result.ok || !Array.isArray(result.data)) {
    return 0;
  }

  return result.data.length;
}
