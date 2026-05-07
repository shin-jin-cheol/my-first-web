"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findCommentById } from "@/lib/comment-utils";
import { getFormNumber, getFormString } from "@/lib/form-utils";
import { getMemberProfile, requireSession } from "@/lib/auth";
import { addGuestCommentById, addGuestPost, deleteGuestCommentById, deleteGuestPostById, getGuestPostById, getGuestPosts, updateGuestCommentById, updateGuestPostById } from "@/lib/guest-posts";
import { isRedirectError } from "@/lib/redirect-error";
import { canManageComment, canManagePost } from "@/lib/permissions";
import { normalizeAttachment, normalizeCategory } from "@/lib/utils";
import { tk } from "@/lib/i18n";

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
    redirect(`/guest/${postId}?error=${encodeURIComponent("방명록 삭제에 실패했습니다.")}`);
  }

  revalidatePath("/guest", "page");
  revalidatePath("/posts", "page");
  redirect(`/guest?deleted=${Date.now()}`);
}

export async function addCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const content = getFormString(formData, "comment");

  if (!content) {
    redirect(`/guest/${postId}?comment=empty`);
  }

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

  revalidatePath(`/guest/${postId}`, "page");
  revalidatePath("/guest", "page");
  revalidatePath("/posts", "page");
  redirect(`/guest/${postId}?commented=${Date.now()}`);
}

export async function updateCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const commentId = getFormNumber(formData, "commentId");
  const content = getFormString(formData, "content");

  if (!commentId || !content) {
    redirect(`/guest/${postId}`);
  }

  const [currentSession, currentPost] = await Promise.all([
    currentSessionPromise,
    getGuestPostById(postId),
  ]);
  const targetComment = findCommentById(currentPost?.comments, commentId);
  const canManageCommentResult = targetComment ? canManageComment(currentSession, targetComment) : false;

  if (!canManageCommentResult) {
    redirect(`/guest/${postId}`);
  }

  await updateGuestCommentById(postId, commentId, content);
  revalidatePath(`/guest/${postId}`, "page");
  revalidatePath("/guest", "page");
  revalidatePath("/posts", "page");
  redirect(`/guest/${postId}?comment-updated=${Date.now()}`);
}

export async function deleteCommentAction(postId: number, formData: FormData) {
  const currentSessionPromise = requireSession();
  const commentId = getFormNumber(formData, "commentId");

  if (!commentId) {
    redirect(`/guest/${postId}`);
  }

  const [currentSession, currentPost] = await Promise.all([
    currentSessionPromise,
    getGuestPostById(postId),
  ]);
  const targetComment = findCommentById(currentPost?.comments, commentId);
  const canManageCommentResult = targetComment ? canManageComment(currentSession, targetComment) : false;

  if (!canManageCommentResult) {
    redirect(`/guest/${postId}`);
  }

  const deleted = await deleteGuestCommentById(postId, commentId);
  if (!deleted) {
    redirect(`/guest/${postId}?error=${encodeURIComponent("댓글 삭제에 실패했습니다.")}`);
  }
  revalidatePath(`/guest/${postId}`, "page");
  revalidatePath("/guest", "page");
  revalidatePath("/posts", "page");
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

  if (!title) {
    const message = encodeURIComponent("제목을 입력해 주세요.");
    redirect(`/guest/${postId}/edit?error=${message}`);
  }

  if (!content) {
    const message = encodeURIComponent("내용을 입력해 주세요.");
    redirect(`/guest/${postId}/edit?error=${message}`);
  }

  await updateGuestPostById(postId, {
    title,
    content,
    category: normalizeCategory(category, "guest"),
  });

  revalidatePath("/guest", "page");
  revalidatePath("/posts", "page");
  redirect(`/guest?updated=${Date.now()}`);
}
