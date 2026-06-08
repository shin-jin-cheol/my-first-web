"use server";

import { revalidatePath } from "next/cache";
import { getFormString } from "@/lib/form-utils";
import { requireSession } from "@/lib/auth";
import { SUPABASE_CHAT_IMAGES_BUCKET } from "@/lib/env";
import { createNotification } from "@/lib/notifications";
import {
  getMessageReadStatuses,
  getMessages,
  getRoom,
  isChatRoomParticipant,
  markMessagesAsRead,
  sendMessage,
  type Message,
  type MessageReadStatus,
} from "@/lib/chat";

export type ChatWindowData = {
  initialMessages: Message[];
  currentUserId: string;
  chatImagesBucket: string;
};

export async function sendChatMessageAction(formData: FormData): Promise<Message | null> {
  const session = await requireSession();
  const roomId = getFormString(formData, "roomId");
  const content = getFormString(formData, "content");
  const imageUrl = getFormString(formData, "imageUrl");

  if (!roomId || (!content && !imageUrl)) {
    return null;
  }

  const room = await getRoom(roomId);
  if (!room || !isChatRoomParticipant(room, session.userId)) {
    return null;
  }

  const message = await sendMessage(roomId, session.userId, content, imageUrl);
  const receiverId = room.user_a_id === session.userId ? room.user_b_id : room.user_a_id;
  const senderName = session.userName?.trim() || session.userId;
  await createNotification(
    receiverId,
    "chat",
    "새 메시지",
    `${senderName}님이 메시지를 보냈습니다`,
    `/chat/${roomId}`,
  );

  revalidatePath(`/chat/${encodeURIComponent(roomId)}`, "page");

  return message;
}

export async function getChatWindowDataAction(roomId: string): Promise<ChatWindowData | null> {
  const session = await requireSession();
  const normalizedRoomId = roomId.trim();

  if (!normalizedRoomId) {
    return null;
  }

  const room = await getRoom(normalizedRoomId);
  if (!room || !isChatRoomParticipant(room, session.userId)) {
    return null;
  }

  const initialMessages = await getMessages(normalizedRoomId);

  return {
    initialMessages,
    currentUserId: session.userId,
    chatImagesBucket: SUPABASE_CHAT_IMAGES_BUCKET,
  };
}

export async function markMessagesAsReadAction(roomId: string): Promise<boolean> {
  const session = await requireSession();
  const normalizedRoomId = roomId.trim();

  if (!normalizedRoomId) {
    return false;
  }

  const room = await getRoom(normalizedRoomId);
  if (!room || !isChatRoomParticipant(room, session.userId)) {
    return false;
  }

  const otherUserId = room.user_a_id === session.userId ? room.user_b_id : room.user_a_id;
  return markMessagesAsRead(normalizedRoomId, otherUserId);
}

export async function getMessageReadStatusesAction(
  roomId: string,
): Promise<MessageReadStatus[]> {
  const session = await requireSession();
  const normalizedRoomId = roomId.trim();

  if (!normalizedRoomId) {
    return [];
  }

  const room = await getRoom(normalizedRoomId);
  if (!room || !isChatRoomParticipant(room, session.userId)) {
    return [];
  }

  return getMessageReadStatuses(normalizedRoomId);
}
