"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { updateMemberAvatarUrl } from "@/lib/auth/core";

export async function saveAvatarUrlAction(avatarUrl: string): Promise<void> {
  const session = await requireSession();
  const normalizedAvatarUrl = avatarUrl.trim();

  if (!normalizedAvatarUrl) {
    throw new Error("Avatar URL is required.");
  }

  await updateMemberAvatarUrl(session.userId, normalizedAvatarUrl);
  revalidatePath(`/profile/${encodeURIComponent(session.userId)}`);
  revalidatePath("/");
}
