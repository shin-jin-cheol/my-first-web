import type { Session } from "@/lib/auth";

export function canManagePost(session: Session | null | undefined, post: { authorId?: string | number | undefined }) {
  if (!session) return false;
  return (
    session.role === "owner" || (session.role === "member" && String(post.authorId) === String(session.userId))
  );
}

export function canManageComment(session: Session | null | undefined, comment: { authorId: string | number }) {
  if (!session) return false;
  return session.role === "owner" || String(comment.authorId) === String(session.userId);
}
