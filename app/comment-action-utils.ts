import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Session } from "@/lib/auth";
import { findCommentById } from "@/lib/comment-utils";
import { getFormNumber, getFormString } from "@/lib/form-utils";
import { canManageComment } from "@/lib/permissions";

type CommentLike = {
  id: number;
  authorId: string | number;
};

export function getRequiredCommentContent(formData: FormData, fieldName: string, redirectPath: string) {
  const content = getFormString(formData, fieldName);

  if (!content) {
    redirect(redirectPath);
  }

  return content;
}

export function getRequiredCommentId(formData: FormData, redirectPath: string) {
  const commentId = getFormNumber(formData, "commentId");

  if (!commentId) {
    redirect(redirectPath);
  }

  return commentId;
}

export function requireManageableComment<TComment extends CommentLike>(
  session: Session,
  comments: TComment[] | undefined | null,
  commentId: number,
  redirectPath: string,
) {
  const targetComment = findCommentById(comments, commentId);
  const canManageCommentResult = targetComment ? canManageComment(session, targetComment) : false;

  if (!canManageCommentResult) {
    redirect(redirectPath);
  }

  return targetComment;
}

export function revalidateCommentPaths(detailPath: string, listPaths: string[]) {
  revalidatePath(detailPath, "page");

  for (const path of listPaths) {
    revalidatePath(path, "page");
  }
}
