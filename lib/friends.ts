import { SUPABASE_FRIENDS_TABLE, SUPABASE_URL } from "@/lib/env";
import { requestSupabaseHttp } from "@/lib/supabase/http";
import { hasSupabaseStorage } from "@/lib/storage";

export type FriendStatus = "pending" | "accepted" | "rejected";

export type Friend = {
  id: number;
  requesterId: string;
  receiverId: string;
  status: FriendStatus;
  createdAt: string;
};

type SupabaseFriendRow = {
  id: number;
  requester_id: string;
  receiver_id: string;
  status: FriendStatus;
  created_at: string;
};

function getSupabaseFriendsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_FRIENDS_TABLE}`;
  return `${base}${query}`;
}

async function requestSupabaseFriends<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabaseFriendsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

function mapSupabaseRowToFriend(row: SupabaseFriendRow): Friend {
  return {
    id: row.id,
    requesterId: row.requester_id,
    receiverId: row.receiver_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function sendFriendRequest(
  requesterId: string,
  receiverId: string,
): Promise<Friend | undefined> {
  if (!hasSupabaseStorage()) {
    return undefined;
  }

  const result = await requestSupabaseFriends<SupabaseFriendRow[]>(
    "POST",
    "",
    [{ requester_id: requesterId, receiver_id: receiverId }],
    "return=representation",
  );

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return undefined;
  }

  return mapSupabaseRowToFriend(result.data[0]);
}

export async function acceptFriendRequest(id: number): Promise<boolean> {
  if (!hasSupabaseStorage()) {
    return false;
  }

  const result = await requestSupabaseFriends<SupabaseFriendRow[]>(
    "PATCH",
    `?id=eq.${id}&select=id,requester_id,receiver_id,status,created_at`,
    { status: "accepted" },
    "return=representation",
  );

  return Boolean(result.ok && Array.isArray(result.data) && result.data.length > 0);
}

export async function rejectFriendRequest(id: number): Promise<boolean> {
  if (!hasSupabaseStorage()) {
    return false;
  }

  const result = await requestSupabaseFriends<SupabaseFriendRow[]>(
    "PATCH",
    `?id=eq.${id}&select=id,requester_id,receiver_id,status,created_at`,
    { status: "rejected" },
    "return=representation",
  );

  return Boolean(result.ok && Array.isArray(result.data) && result.data.length > 0);
}

export async function deleteFriend(id: number): Promise<boolean> {
  if (!hasSupabaseStorage()) {
    return false;
  }

  const result = await requestSupabaseFriends<SupabaseFriendRow[]>(
    "DELETE",
    `?id=eq.${id}&select=id,requester_id,receiver_id,status,created_at`,
    undefined,
    "return=representation",
  );

  return Boolean(result.ok && Array.isArray(result.data) && result.data.length > 0);
}

export async function getFriends(userId: string): Promise<Friend[]> {
  if (!hasSupabaseStorage()) {
    return [];
  }

  const encodedUserId = encodeURIComponent(userId);
  const result = await requestSupabaseFriends<SupabaseFriendRow[]>(
    "GET",
    `?select=id,requester_id,receiver_id,status,created_at&status=eq.accepted&or=(requester_id.eq.${encodedUserId},receiver_id.eq.${encodedUserId})&order=created_at.desc`,
  );

  if (!result.ok || !Array.isArray(result.data)) {
    return [];
  }

  return result.data.map(mapSupabaseRowToFriend);
}

export async function getPendingRequests(userId: string): Promise<Friend[]> {
  if (!hasSupabaseStorage()) {
    return [];
  }

  const encodedUserId = encodeURIComponent(userId);
  const result = await requestSupabaseFriends<SupabaseFriendRow[]>(
    "GET",
    `?select=id,requester_id,receiver_id,status,created_at&receiver_id=eq.${encodedUserId}&status=eq.pending&order=created_at.desc`,
  );

  if (!result.ok || !Array.isArray(result.data)) {
    return [];
  }

  return result.data.map(mapSupabaseRowToFriend);
}

export async function getFriendStatus(
  requesterId: string,
  receiverId: string,
): Promise<Friend | undefined> {
  if (!hasSupabaseStorage()) {
    return undefined;
  }

  const encodedRequesterId = encodeURIComponent(requesterId);
  const encodedReceiverId = encodeURIComponent(receiverId);
  const result = await requestSupabaseFriends<SupabaseFriendRow[]>(
    "GET",
    `?select=id,requester_id,receiver_id,status,created_at&or=(and(requester_id.eq.${encodedRequesterId},receiver_id.eq.${encodedReceiverId}),and(requester_id.eq.${encodedReceiverId},receiver_id.eq.${encodedRequesterId}))&limit=1`,
  );

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return undefined;
  }

  return mapSupabaseRowToFriend(result.data[0]);
}
