"use server";

import { revalidatePath } from "next/cache";
import { getFormNumber, getFormString } from "@/lib/form-utils";
import { requireSession } from "@/lib/auth";
import {
  acceptFriendRequest,
  deleteFriend,
  rejectFriendRequest,
  sendFriendRequest,
} from "@/lib/friends";

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
