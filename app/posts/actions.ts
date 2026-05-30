"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFormNumber, getFormString } from "@/lib/form-utils";
import { getSession, requireSession } from "@/lib/auth";
import { OWNER_ID } from "@/lib/env";
import {
  addPost,
  addPostCommentByPostId,
  deletePostById,
  deletePostCommentById,
  getPostById,
  getPostCommentsByPostId,
  updatePostById,
  updatePostCommentById,
  addPostReaction,
  removePostReaction,
  getPostReactions,
  addPostCommentReaction,
  removePostCommentReaction,
  getPostCommentReactions,
} from "@/lib/posts";
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

export async function createPost(formData: FormData) {
  try {
    const session = await requireSession();
    if (session.role !== "owner") {
      redirect("/guest/new");
    }

    const title = getFormString(formData, "title");
    const author = getFormString(formData, "author");
    const content = getFormString(formData, "content");
    const category = getFormString(formData, "category", "study");
    const linkUrl = getFormString(formData, "linkUrl");
    const imageUrl = getFormString(formData, "imageUrl");
    const attachmentFile = formData.get("attachment");

    if (!title) {
      redirect(`/posts/new?error=${encodeURIComponent(tk("ko", "titleRequired"))}`);
    }

    if (!author || !content) {
      redirect(`/posts/new?error=${encodeURIComponent(tk("ko", "authorContentRequired"))}`);
    }

    await addPost({
      title,
      author,
      authorId: undefined,
      content,
      category: normalizeCategory(category, "blog"),
      linkUrl,
      imageUrl: imageUrl || undefined,
      attachmentFile: normalizeAttachment(attachmentFile),
    });

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/guest");
    redirect("/posts");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : tk("ko", "postSaveFailed");
    redirect(`/posts/new?error=${encodeURIComponent(message)}`);
  }
}

export async function deletePostAction(postId: number) {
  const [currentSession, currentPost] = await Promise.all([
    getSession(),
    getPostById(postId),
  ]);

  const canDeletePost = canManagePost(currentSession ?? null, currentPost ?? { authorId: undefined });

  if (!canDeletePost) {
    redirect(`/posts/${postId}`);
  }

  const deleted = await deletePostById(postId);
  if (!deleted) {
    redirect(`/posts/${postId}?error=${encodeURIComponent(tk("ko", "postDeleteFailed"))}`);
  }

  revalidatePath("/", "page");
  revalidatePath("/posts", "page");
  redirect(`/posts?deleted=${Date.now()}`);
}

export async function addCommentAction(postId: number, formData: FormData) {
  const currentSession = await requireSession();
  const content = getRequiredCommentContent(formData, "comment", `/posts/${postId}?comment=empty`);

  const currentPost = await getPostById(postId);
  if (!currentPost) {
    redirect("/posts");
  }

  const authorName = currentSession.userName?.trim() || currentSession.userId;

  await addPostCommentByPostId(postId, {
    authorId: currentSession.userId,
    authorName,
    content,
  });
  const notificationUserId = currentPost.authorId || OWNER_ID;
  if (notificationUserId && notificationUserId !== currentSession.userId) {
    await createNotification(
      notificationUserId,
      "comment",
      "새 댓글",
      `${authorName}님이 댓글을 달았습니다`,
      `/posts/${postId}`,
    );
  }

  revalidateCommentPaths(`/posts/${postId}`, ["/posts"]);
  redirect(`/posts/${postId}?commented=${Date.now()}`);
}

export async function updateCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const commentId = getRequiredCommentId(formData, `/posts/${postId}`);
  const content = getRequiredCommentContent(formData, "content", `/posts/${postId}`);

  const [currentSession, currentComments] = await Promise.all([
    currentSessionPromise,
    getPostCommentsByPostId(postId),
  ]);
  requireManageableComment(currentSession, currentComments, commentId, `/posts/${postId}`);

  await updatePostCommentById(postId, commentId, content);
  revalidateCommentPaths(`/posts/${postId}`, ["/posts"]);
  redirect(`/posts/${postId}?comment-updated=${Date.now()}`);
}

export async function deleteCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const commentId = getRequiredCommentId(formData, `/posts/${postId}`);

  const [currentSession, currentComments] = await Promise.all([
    currentSessionPromise,
    getPostCommentsByPostId(postId),
  ]);
  requireManageableComment(currentSession, currentComments, commentId, `/posts/${postId}`);

  const deleted = await deletePostCommentById(postId, commentId);
  if (!deleted) {
    redirect(`/posts/${postId}?error=${encodeURIComponent(tk("ko", "commentDeleteFailed"))}`);
  }
  revalidateCommentPaths(`/posts/${postId}`, ["/posts"]);
  redirect(`/posts/${postId}?comment-deleted=${Date.now()}`);
}

export async function updatePostAction(postId: number, formData: FormData) {
  const currentSession = await requireSession();
  const currentPost = await getPostById(postId);
  const canUpdate = canManagePost(currentSession, currentPost ?? { authorId: undefined });

  if (!canUpdate) {
    redirect(`/posts/${postId}`);
  }

  const title = getFormString(formData, "title");
  const author = getFormString(formData, "author");
  const content = getFormString(formData, "content");
  const category = getFormString(formData, "category", "study");
  const linkUrl = getFormString(formData, "linkUrl");
  const imageUrl = getFormString(formData, "imageUrl");
  const attachmentFile = formData.get("attachment");
  const removeAttachment = formData.get("removeAttachment") === "on";

  if (!title || !author || !content) {
    redirect(`/posts/${postId}/edit?error=${encodeURIComponent("제목, 작성자, 내용은 필수입니다.")}`);
  }

  if (currentSession.role !== "owner" && category === "notice") {
    redirect(`/posts/${postId}`);
  }

  await updatePostById(postId, {
    title,
    author,
    content,
    category: normalizeCategory(category, "blog"),
    linkUrl,
    imageUrl: imageUrl || undefined,
    attachmentFile: normalizeAttachment(attachmentFile),
    removeAttachment,
  });

  revalidatePath("/", "page");
  revalidatePath("/posts", "page");
  revalidatePath(`/posts/${postId}`, "page");
  redirect(`/posts/${postId}?updated=${Date.now()}`);
}

export async function addReplyAction(postId: number, parentCommentId: number, formData: FormData) {
  const currentSession = await requireSession();
  const content = getRequiredCommentContent(formData, "reply", `/posts/${postId}`);

  const currentPost = await getPostById(postId);
  if (!currentPost) {
    redirect("/posts");
  }

  const authorName = currentSession.userName?.trim() || currentSession.userId;

  await addPostCommentByPostId(postId, {
    authorId: currentSession.userId,
    authorName,
    content,
    parentId: parentCommentId,
  });
  const notificationUserId = currentPost.authorId || OWNER_ID;
  if (notificationUserId && notificationUserId !== currentSession.userId) {
    await createNotification(
      notificationUserId,
      "comment",
      "새 댓글",
      `${authorName}님이 댓글을 달았습니다`,
      `/posts/${postId}`,
    );
  }

  revalidateCommentPaths(`/posts/${postId}`, ["/posts"]);
  redirect(`/posts/${postId}?replied=${Date.now()}`);
}

export async function togglePostReactionAction(formData: FormData) {
  const postId = getFormNumber(formData, "postId");
  const emoji = getFormString(formData, "emoji");
  if (!postId || !emoji) {
    redirect("/posts");
  }

  const currentSession = await requireSession();
  const currentReactions = await getPostReactions(postId);
  const hasReaction = currentReactions.some(
    (r) => r.memberId === currentSession.userId && r.emoji === emoji,
  );

  if (hasReaction) {
    const removed = await removePostReaction(postId, currentSession.userId, emoji);
    assertReactionMutation(removed, `/posts/${postId}`);
  } else {
    const added = await addPostReaction(postId, currentSession.userId, emoji);
    assertReactionMutation(Boolean(added), `/posts/${postId}`);
  }

  revalidatePath(`/posts/${postId}`, "page");
}

export async function togglePostCommentReactionAction(
  formData: FormData,
) {
  const postId = getFormNumber(formData, "postId");
  const commentId = getFormNumber(formData, "commentId");
  const emoji = getFormString(formData, "emoji");
  if (!postId || !commentId || !emoji) {
    redirect("/posts");
  }

  const currentSession = await requireSession();
  const currentReactions = await getPostCommentReactions(commentId);
  const hasReaction = currentReactions.some(
    (r) => r.memberId === currentSession.userId && r.emoji === emoji,
  );

  if (hasReaction) {
    const removed = await removePostCommentReaction(commentId, currentSession.userId, emoji);
    assertReactionMutation(removed, `/posts/${postId}`);
  } else {
    const added = await addPostCommentReaction(commentId, currentSession.userId, emoji);
    assertReactionMutation(Boolean(added), `/posts/${postId}`);
  }

  revalidatePath(`/posts/${postId}`, "page");
}
