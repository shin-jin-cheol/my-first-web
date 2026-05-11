"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFormString } from "@/lib/form-utils";
import { getSession, requireSession } from "@/lib/auth";
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
import { getRequiredCommentContent, getRequiredCommentId, requireManageableComment, revalidateCommentPaths } from "@/app/comment-action-utils";

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
  const attachmentFile = formData.get("attachment");
  const removeAttachment = formData.get("removeAttachment") === "on";

  if (!title || !author || !content) {
    return;
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

  revalidateCommentPaths(`/posts/${postId}`, ["/posts"]);
  redirect(`/posts/${postId}?replied=${Date.now()}`);
}

export async function togglePostReactionAction(postId: number, emoji: string, formData: FormData) {
  void formData;
  const currentSession = await requireSession();
  const currentReactions = await getPostReactions(postId);
  const hasReaction = currentReactions.some(
    (r) => r.memberId === currentSession.userId && r.emoji === emoji,
  );

  if (hasReaction) {
    await removePostReaction(postId, currentSession.userId, emoji);
  } else {
    await addPostReaction(postId, currentSession.userId, emoji);
  }

  revalidatePath(`/posts/${postId}`, "page");
}

export async function togglePostCommentReactionAction(
  postId: number,
  commentId: number,
  emoji: string,
  formData: FormData,
) {
  void formData;
  const currentSession = await requireSession();
  const currentReactions = await getPostCommentReactions(commentId);
  const hasReaction = currentReactions.some(
    (r) => r.memberId === currentSession.userId && r.emoji === emoji,
  );

  if (hasReaction) {
    await removePostCommentReaction(commentId, currentSession.userId, emoji);
  } else {
    await addPostCommentReaction(commentId, currentSession.userId, emoji);
  }

  revalidatePath(`/posts/${postId}`, "page");
}
