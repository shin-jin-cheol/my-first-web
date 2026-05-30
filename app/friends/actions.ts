"use server";

import { revalidatePath } from "next/cache";
import { getFormNumber, getFormString } from "@/lib/form-utils";
import { requireSession } from "@/lib/auth";
import {
  acceptFriendRequest,
  deleteFriend,
  getFriendStatus,
  rejectFriendRequest,
  sendFriendRequest,
} from "@/lib/friends";
import { getOrCreateRoom } from "@/lib/chat";
import { createNotification } from "@/lib/notifications";

function revalidateFriendPaths(userId: string) {
  revalidatePath("/friends", "page");
  revalidatePath(`/profile/${encodeURIComponent(userId)}`, "page");
}

export async function sendFriendRequestAction(formData: FormData): Promise<boolean> {
  const receiverId = getFormString(formData, "receiverId");
  const session = await requireSession();

  if (!receiverId) {
    revalidateFriendPaths(session.userId);
    return false;
  }

  if (receiverId === session.userId) {
    revalidateFriendPaths(session.userId);
    return false;
  }

  const friend = await sendFriendRequest(session.userId, receiverId);
  if (friend) {
    const senderName = session.userName?.trim() || session.userId;
    await createNotification(
      receiverId,
      "friend_request",
      "친구 요청",
      `${senderName}님이 친구 요청을 보냈습니다`,
      "/friends",
    );
  }

  revalidateFriendPaths(session.userId);
  revalidatePath(`/profile/${encodeURIComponent(receiverId)}`, "page");

  return Boolean(friend);
}

export async function acceptFriendRequestAction(formData: FormData): Promise<boolean> {
  const friendId = getFormNumber(formData, "friendId");
  const session = await requireSession();

  if (!friendId) {
    revalidateFriendPaths(session.userId);
    return false;
  }

  const accepted = await acceptFriendRequest(friendId, session.userId);
  revalidateFriendPaths(session.userId);

  return accepted;
}

export async function rejectFriendRequestAction(formData: FormData): Promise<boolean> {
  const friendId = getFormNumber(formData, "friendId");
  const session = await requireSession();

  if (!friendId) {
    revalidateFriendPaths(session.userId);
    return false;
  }

  const rejected = await rejectFriendRequest(friendId, session.userId);
  revalidateFriendPaths(session.userId);

  return rejected;
}

export async function deleteFriendAction(formData: FormData): Promise<boolean> {
  const friendId = getFormNumber(formData, "friendId");
  const session = await requireSession();

  if (!friendId) {
    revalidateFriendPaths(session.userId);
    return false;
  }

  const deleted = await deleteFriend(friendId, session.userId);
  revalidateFriendPaths(session.userId);

  return deleted;
}

export async function getChatRoomAction(friendId: string): Promise<string> {
  const session = await requireSession();
  const normalizedFriendId = friendId.trim();

  if (!normalizedFriendId || normalizedFriendId === session.userId) {
    throw new Error("Invalid friend id");
  }

  const friendStatus = await getFriendStatus(session.userId, normalizedFriendId);
  if (!friendStatus || friendStatus.status !== "accepted") {
    throw new Error("Chat room requires an accepted friend");
  }

  const room = await getOrCreateRoom(session.userId, normalizedFriendId);
  return room.id;
}
