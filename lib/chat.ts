import {
  SUPABASE_CHAT_ROOMS_TABLE,
  SUPABASE_MESSAGES_TABLE,
  SUPABASE_URL,
} from "@/lib/env";
import { requestSupabaseHttp } from "@/lib/supabase/http";
import { hasSupabaseStorage } from "@/lib/storage";

export type ChatRoom = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function getSupabaseRestEndpoint(table: string, query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}`;
  return `${base}${query}`;
}

async function requestChatRooms<T>(
  method: "GET" | "POST",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabaseRestEndpoint(SUPABASE_CHAT_ROOMS_TABLE, query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

async function requestMessages<T>(
  method: "GET" | "POST",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabaseRestEndpoint(SUPABASE_MESSAGES_TABLE, query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

function assertSupabaseChatStorage() {
  if (!hasSupabaseStorage()) {
    throw new Error("Supabase storage is not configured for chat");
  }
}

function normalizeRoomUserIds(userAId: string, userBId: string) {
  const firstUserId = userAId.trim();
  const secondUserId = userBId.trim();

  if (!firstUserId || !secondUserId) {
    throw new Error("Chat room user ids are required");
  }

  if (firstUserId === secondUserId) {
    throw new Error("Chat room requires two distinct users");
  }

  return firstUserId < secondUserId
    ? { user_a_id: firstUserId, user_b_id: secondUserId }
    : { user_a_id: secondUserId, user_b_id: firstUserId };
}

async function findRoom(userAId: string, userBId: string): Promise<ChatRoom | undefined> {
  const encodedUserAId = encodeURIComponent(userAId);
  const encodedUserBId = encodeURIComponent(userBId);
  const result = await requestChatRooms<ChatRoom[]>(
    "GET",
    `?select=id,user_a_id,user_b_id,created_at&user_a_id=eq.${encodedUserAId}&user_b_id=eq.${encodedUserBId}&limit=1`,
  );

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return undefined;
  }

  return result.data[0];
}

export async function getRoom(roomId: string): Promise<ChatRoom | undefined> {
  assertSupabaseChatStorage();

  const normalizedRoomId = roomId.trim();
  if (!normalizedRoomId) {
    return undefined;
  }

  const encodedRoomId = encodeURIComponent(normalizedRoomId);
  const result = await requestChatRooms<ChatRoom[]>(
    "GET",
    `?select=id,user_a_id,user_b_id,created_at&id=eq.${encodedRoomId}&limit=1`,
  );

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return undefined;
  }

  return result.data[0];
}

export function isChatRoomParticipant(room: ChatRoom, userId: string) {
  return room.user_a_id === userId || room.user_b_id === userId;
}

export async function getOrCreateRoom(userAId: string, userBId: string): Promise<ChatRoom> {
  assertSupabaseChatStorage();

  const roomUsers = normalizeRoomUserIds(userAId, userBId);
  const existingRoom = await findRoom(roomUsers.user_a_id, roomUsers.user_b_id);

  if (existingRoom) {
    return existingRoom;
  }

  const result = await requestChatRooms<ChatRoom[]>(
    "POST",
    "",
    [roomUsers],
    "return=representation",
  );

  if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
    return result.data[0];
  }

  const roomAfterConflict = await findRoom(roomUsers.user_a_id, roomUsers.user_b_id);
  if (roomAfterConflict) {
    return roomAfterConflict;
  }

  throw new Error("Failed to create chat room");
}

export async function getMessages(roomId: string): Promise<Message[]> {
  assertSupabaseChatStorage();

  const normalizedRoomId = roomId.trim();
  if (!normalizedRoomId) {
    return [];
  }

  const encodedRoomId = encodeURIComponent(normalizedRoomId);
  const result = await requestMessages<Message[]>(
    "GET",
    `?select=id,room_id,sender_id,content,created_at&room_id=eq.${encodedRoomId}&order=created_at.desc&limit=100`,
  );

  if (!result.ok || !Array.isArray(result.data)) {
    return [];
  }

  return result.data.reverse();
}

export async function sendMessage(
  roomId: string,
  senderId: string,
  content: string,
): Promise<Message> {
  assertSupabaseChatStorage();

  const normalizedRoomId = roomId.trim();
  const normalizedSenderId = senderId.trim();
  const normalizedContent = content.trim();

  if (!normalizedRoomId) {
    throw new Error("Message room id is required");
  }

  if (!normalizedSenderId) {
    throw new Error("Message sender id is required");
  }

  if (!normalizedContent) {
    throw new Error("Message content is required");
  }

  const result = await requestMessages<Message[]>(
    "POST",
    "",
    [
      {
        room_id: normalizedRoomId,
        sender_id: normalizedSenderId,
        content: normalizedContent,
      },
    ],
    "return=representation",
  );

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    throw new Error("Failed to send chat message");
  }

  return result.data[0];
}
