"use server";

import { revalidatePath } from "next/cache";
import { getFormString } from "@/lib/form-utils";
import { requireSession } from "@/lib/auth";
import { SUPABASE_CHAT_IMAGES_BUCKET } from "@/lib/env";
import {
  getMessages,
  getRoom,
  isChatRoomParticipant,
  sendMessage,
  type Message,
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
