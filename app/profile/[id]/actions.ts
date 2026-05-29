"use server";

import { revalidatePath } from "next/cache";
import { getFormString } from "@/lib/form-utils";
import { requireSession } from "@/lib/auth";
import { updateMemberAvatarUrl } from "@/lib/auth/core";
import { sanitizeFileName } from "@/lib/attachment-utils";
import { saveAvatarFile } from "@/lib/storage";

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;

function getAvatarExtension(file: File) {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/gif") {
    return "gif";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "bin";
}

export async function uploadAvatarAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const targetUserId = getFormString(formData, "userId");

  if (!targetUserId || targetUserId !== session.userId) {
    throw new Error("Unauthorized avatar upload.");
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Avatar image is required.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Avatar image must be 10MB or smaller.");
  }

  const safeUserId = sanitizeFileName(session.userId);
  const storagePath = `${safeUserId}/${Date.now()}.${getAvatarExtension(file)}`;
  const avatarUrl = await saveAvatarFile(file, storagePath);

  await updateMemberAvatarUrl(session.userId, avatarUrl);
  revalidatePath(`/profile/${encodeURIComponent(session.userId)}`);
  revalidatePath("/");
}
