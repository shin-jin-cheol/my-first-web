"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFormNumber, getFormString } from "@/lib/form-utils";
import { getMemberProfile, requireSession } from "@/lib/auth";
import {
  addGuestCommentById,
  addGuestPost,
  deleteGuestCommentById,
  deleteGuestPostById,
  getGuestPostById,
  getGuestPosts,
  updateGuestCommentById,
  updateGuestPostById,
  addGuestPostReaction,
  removeGuestPostReaction,
  getGuestPostReactions,
  addGuestCommentReaction,
  removeGuestCommentReaction,
  getGuestCommentReactions,
} from "@/lib/guest-posts";
import { isRedirectError } from "@/lib/redirect-error";
import { canManagePost } from "@/lib/permissions";
import { normalizeAttachment, normalizeCategory } from "@/lib/utils";
import { tk } from "@/lib/i18n";
import { createNotification } from "@/lib/notifications";
import { getRequiredCommentContent, getRequiredCommentId, requireManageableComment, revalidateCommentPaths } from "@/app/comment-action-utils";

function assertReactionMutation(succeeded: boolean, redirectPath: string) {
  if (!succeeded) {
    redirect(`${redirectPath}?error=${encodeURIComponent("reaction-save-failed")}`);
  }
}

export async function createGuestPost(formData: FormData) {
  try {
    const session = await requireSession();
    if (session.role !== "member") {
      redirect("/guest");
    }

    const title = getFormString(formData, "title");
    const content = getFormString(formData, "content");
    const category = getFormString(formData, "category", "study");
    const linkUrl = getFormString(formData, "linkUrl");
    const youtubeUrl = getFormString(formData, "youtubeUrl");
    const imageUrl = getFormString(formData, "imageUrl");
    const attachmentFile = formData.get("attachment");
    const profile = await getMemberProfile(session.userId);
    const authorName = profile?.name?.trim() || session.userName?.trim() || session.userId;

    if (!title || !content) {
      redirect(`/guest/new?error=${encodeURIComponent(tk("ko", "titleContentRequired"))}`);
    }

    await addGuestPost({
      title,
      content,
      authorId: session.userId,
      authorName,
      category: normalizeCategory(category, "guest"),
      linkUrl,
      youtubeUrl,
      imageUrl: imageUrl || undefined,
      attachmentFile: normalizeAttachment(attachmentFile),
    });

    revalidatePath("/guest");
    revalidatePath("/posts");
    redirect("/guest");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : tk("ko", "guestPostSaveFailed");
    redirect(`/guest/new?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteGuestPostAction(postIdOrFormData: number | FormData) {
  if (typeof postIdOrFormData !== "number") {
    const currentSession = await requireSession();
    const postId = getFormNumber(postIdOrFormData, "postId");
    if (!postId) {
      return;
    }

    const currentPosts = await getGuestPosts();
    const targetPost = currentPosts.find((post) => post.id === postId);
    const canDelete =
      currentSession.role === "owner" ||
      (currentSession.role === "member" && targetPost?.authorId === currentSession.userId);

    if (!canDelete) {
      return;
    }

    await deleteGuestPostById(postId);
    revalidatePath("/guest", "page");
    revalidatePath("/posts", "page");
    redirect(`/guest?deleted=${Date.now()}`);
  }

  const postId = postIdOrFormData;
  const [currentSession, currentPost] = await Promise.all([
    requireSession(),
    getGuestPostById(postId),
  ]);
  const canDelete = canManagePost(currentSession, currentPost ?? { authorId: undefined });

  if (!canDelete) {
    redirect(`/guest/${postId}`);
  }

  const deleted = await deleteGuestPostById(postId);
  if (!deleted) {
    redirect(`/guest/${postId}?error=${encodeURIComponent(tk("ko", "guestPostDeleteFailed"))}`);
  }

  revalidatePath("/guest", "page");
  revalidatePath("/posts", "page");
  redirect(`/guest?deleted=${Date.now()}`);
}

export async function addCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const content = getRequiredCommentContent(formData, "comment", `/guest/${postId}?comment=empty`);

  const [currentSession, currentPost] = await Promise.all([
    currentSessionPromise,
    getGuestPostById(postId),
  ]);
  if (!currentPost) {
    redirect("/guest");
  }

  const authorName = currentSession.userName?.trim() || currentSession.userId;

  await addGuestCommentById(postId, {
    authorId: currentSession.userId,
    authorName,
    content,
  });
  if (currentPost.authorId && currentPost.authorId !== currentSession.userId) {
    await createNotification(
      currentPost.authorId,
      "comment",
      "새 댓글",
      `${authorName}님이 댓글을 달았습니다`,
      `/guest/${postId}`,
    );
  }

  revalidateCommentPaths(`/guest/${postId}`, ["/guest", "/posts"]);
  redirect(`/guest/${postId}?commented=${Date.now()}`);
}

export async function updateCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const commentId = getRequiredCommentId(formData, `/guest/${postId}`);
  const content = getRequiredCommentContent(formData, "content", `/guest/${postId}`);

  const [currentSession, currentPost] = await Promise.all([
    currentSessionPromise,
    getGuestPostById(postId),
  ]);
  requireManageableComment(currentSession, currentPost?.comments, commentId, `/guest/${postId}`);

  await updateGuestCommentById(postId, commentId, content);
  revalidateCommentPaths(`/guest/${postId}`, ["/guest", "/posts"]);
  redirect(`/guest/${postId}?comment-updated=${Date.now()}`);
}

export async function deleteCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const commentId = getRequiredCommentId(formData, `/guest/${postId}`);

  const [currentSession, currentPost] = await Promise.all([
    currentSessionPromise,
    getGuestPostById(postId),
  ]);
  requireManageableComment(currentSession, currentPost?.comments, commentId, `/guest/${postId}`);

  const deleted = await deleteGuestCommentById(postId, commentId);
  if (!deleted) {
    redirect(`/guest/${postId}?error=${encodeURIComponent(tk("ko", "commentDeleteFailed"))}`);
  }
  revalidateCommentPaths(`/guest/${postId}`, ["/guest", "/posts"]);
  redirect(`/guest/${postId}?comment-deleted=${Date.now()}`);
}

export async function updateGuestPostAction(postId: number, formData: FormData) {
  const currentSession = await requireSession();
  const currentPost = await getGuestPostById(postId);
  const canUpdate = canManagePost(currentSession, currentPost ?? { authorId: undefined });

  if (!canUpdate) {
    redirect("/guest");
  }

  const title = getFormString(formData, "title");
  const content = getFormString(formData, "content");
  const category = getFormString(formData, "category", "study");
  const linkUrl = getFormString(formData, "linkUrl");
  const youtubeUrl = getFormString(formData, "youtubeUrl");
  const imageUrl = getFormString(formData, "imageUrl");
  const attachmentFile = formData.get("attachment");
  const removeAttachment = formData.get("removeAttachment") === "on";

  if (!title) {
    const message = encodeURIComponent(tk("ko", "titleRequired"));
    redirect(`/guest/${postId}/edit?error=${message}`);
  }

  if (!content) {
    const message = encodeURIComponent(tk("ko", "contentRequired"));
    redirect(`/guest/${postId}/edit?error=${message}`);
  }

  await updateGuestPostById(postId, {
    title,
    content,
    category: normalizeCategory(category, "guest"),
    linkUrl,
    youtubeUrl,
    imageUrl: imageUrl || undefined,
    attachmentFile: normalizeAttachment(attachmentFile),
    removeAttachment,
  });

  revalidatePath("/guest", "page");
  revalidatePath("/posts", "page");
  redirect(`/guest?updated=${Date.now()}`);
}

export async function addReplyAction(postId: number, parentCommentId: number, formData: FormData) {
  const currentSession = await requireSession();
  const content = getRequiredCommentContent(formData, "reply", `/guest/${postId}`);

  const currentPost = await getGuestPostById(postId);
  if (!currentPost) {
    redirect("/guest");
  }

  const profile = await getMemberProfile(currentSession.userId);
  const authorName = profile?.name?.trim() || currentSession.userName?.trim() || currentSession.userId;

  await addGuestCommentById(postId, {
    authorId: currentSession.userId,
    authorName,
    content,
    parentId: parentCommentId,
  });
  if (currentPost.authorId && currentPost.authorId !== currentSession.userId) {
    await createNotification(
      currentPost.authorId,
      "comment",
      "새 댓글",
      `${authorName}님이 댓글을 달았습니다`,
      `/guest/${postId}`,
    );
  }

  revalidateCommentPaths(`/guest/${postId}`, ["/guest", "/posts"]);
  redirect(`/guest/${postId}?replied=${Date.now()}`);
}

export async function toggleGuestPostReactionAction(formData: FormData) {
  const postId = getFormNumber(formData, "postId");
  const emoji = getFormString(formData, "emoji");
  if (!postId || !emoji) {
    redirect("/guest");
  }

  const currentSession = await requireSession();
  const currentReactions = await getGuestPostReactions(postId);
  const hasReaction = currentReactions.some(
    (r) => r.memberId === currentSession.userId && r.emoji === emoji,
  );

  if (hasReaction) {
    const removed = await removeGuestPostReaction(postId, currentSession.userId, emoji);
    assertReactionMutation(removed, `/guest/${postId}`);
  } else {
    const added = await addGuestPostReaction(postId, currentSession.userId, emoji);
    assertReactionMutation(Boolean(added), `/guest/${postId}`);
  }

  revalidatePath(`/guest/${postId}`, "page");
}

export async function toggleGuestCommentReactionAction(
  formData: FormData,
) {
  const postId = getFormNumber(formData, "postId");
  const commentId = getFormNumber(formData, "commentId");
  const emoji = getFormString(formData, "emoji");
  if (!postId || !commentId || !emoji) {
    redirect("/guest");
  }

  const currentSession = await requireSession();
  const currentReactions = await getGuestCommentReactions(commentId);
  const hasReaction = currentReactions.some(
    (r) => r.memberId === currentSession.userId && r.emoji === emoji,
  );

  if (hasReaction) {
    const removed = await removeGuestCommentReaction(commentId, currentSession.userId, emoji);
    assertReactionMutation(removed, `/guest/${postId}`);
  } else {
    const added = await addGuestCommentReaction(commentId, currentSession.userId, emoji);
    assertReactionMutation(Boolean(added), `/guest/${postId}`);
  }

  revalidatePath(`/guest/${postId}`, "page");
}
