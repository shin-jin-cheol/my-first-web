"use server";

import { revalidatePath } from "next/cache";
import { getFormString } from "@/lib/form-utils";
import { requireSession } from "@/lib/auth";
import { getRoom, isChatRoomParticipant, sendMessage, type Message } from "@/lib/chat";

export async function sendChatMessageAction(formData: FormData): Promise<Message | null> {
  const session = await requireSession();
  const roomId = getFormString(formData, "roomId");
  const content = getFormString(formData, "content");

  if (!roomId || !content) {
    return null;
  }

  const room = await getRoom(roomId);
  if (!room || !isChatRoomParticipant(room, session.userId)) {
    return null;
  }

  const message = await sendMessage(roomId, session.userId, content);
  revalidatePath(`/chat/${encodeURIComponent(roomId)}`, "page");

  return message;
}
