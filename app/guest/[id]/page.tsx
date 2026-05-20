import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getGuestPostById,
  getGuestCommentReactions,
  getGuestPostReactions,
  incrementGuestPostViews,
} from "@/lib/guest-posts";
import { buildDownloadUrl } from "@/lib/download-url";
import { Button } from "@/components/ui/button";
import { PostReaction } from "@/components/post-reaction";
import { getLocale, t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";
import { getCategoryLabel } from "@/lib/post-categories";
import { canManagePost, canManageComment } from "@/lib/permissions";
import {
  addCommentAction,
  addReplyAction,
  deleteCommentAction,
  deleteGuestPostAction,
  updateCommentAction,
  toggleGuestCommentReactionAction,
  toggleGuestPostReactionAction,
} from "@/app/guest/actions";
import { CommentThread, type CommentThreadItem } from "@/components/comment-thread";

type GuestPostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestPostDetailPage({ params }: GuestPostDetailPageProps) {
  const localePromise = getLocale();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    redirect("/guest");
  }

  const sessionPromise = requireSession();
  const [locale, session, post, postReactions] = await Promise.all([
    localePromise,
    sessionPromise,
    getGuestPostById(postId),
    getGuestPostReactions(postId),
  ]);
  if (!post) {
    notFound();
  }

  await incrementGuestPostViews(postId);

  const fileDownloadUrl = post.fileUrl ? buildDownloadUrl(post.fileUrl, post.fileName) : undefined;

  const canManage = canManagePost(session, post);

  // 게시글 반응 데이터 집계
  const postReactionMap = new Map<string, { count: number; userReacted: boolean }>();
  for (const reaction of postReactions) {
    const existing = postReactionMap.get(reaction.emoji) || { count: 0, userReacted: false };
    postReactionMap.set(reaction.emoji, {
      count: existing.count + 1,
      userReacted: reaction.memberId === session.userId ? true : existing.userReacted,
    });
  }
  const postReactionsList = Array.from(postReactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    ...data,
  }));
  
  // 각 댓글의 반응 데이터 조회
  const commentReactionMap = new Map<number, Array<{ emoji: string; count: number; userReacted: boolean }>>();
  for (const comment of post.comments ?? []) {
    const reactions = await getGuestCommentReactions(comment.id);
    const reactionsByEmoji = new Map<string, { count: number; userReacted: boolean }>();
    
    for (const reaction of reactions) {
      const existing = reactionsByEmoji.get(reaction.emoji) || { count: 0, userReacted: false };
      reactionsByEmoji.set(reaction.emoji, {
        count: existing.count + 1,
        userReacted: reaction.memberId === session.userId ? true : existing.userReacted,
      });
    }
    
    commentReactionMap.set(
      comment.id,
      Array.from(reactionsByEmoji.entries()).map(([emoji, data]) => ({
        emoji,
        ...data,
      })),
    );
  }
  
  const commentItems: CommentThreadItem[] = (post.comments ?? []).map((comment) => ({
    ...comment,
    canManage: canManageComment(session, comment),
    reactions: commentReactionMap.get(comment.id),
  }));

  const boundDeleteGuestPostAction = deleteGuestPostAction.bind(null, postId);
  const boundAddCommentAction = addCommentAction.bind(null, postId);
  const boundAddReplyAction = addReplyAction.bind(null, postId);
  const boundUpdateCommentAction = updateCommentAction.bind(null, postId);
  const boundDeleteCommentAction = deleteCommentAction.bind(null, postId);
  const authorProfileHref = `/profile/${encodeURIComponent(post.authorId)}`;

  return (
    <article className="space-y-6 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-8 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">Guest Detail</p>
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-text-muted dark:text-text-subtle">
          <p>
            <strong>{t(locale, "작성자", "Author")}:</strong>{" "}
            <Link href={authorProfileHref} className="font-semibold transition hover:text-accent-sub">
              {post.authorName || post.authorId}
            </Link>
          </p>
          <p>
            <strong>{t(locale, "카테고리", "Category")}:</strong> {getCategoryLabel(post.category)}
          </p>
          <p>
            <strong>{t(locale, "날짜", "Date")}:</strong> {post.date}
          </p>
          <p>
            <strong>{t(locale, "조회수", "Views")}:</strong> {post.views}
          </p>
        </div>
      </header>

      <p className="leading-7 text-text-sub dark:text-text-muted">{post.content}</p>

      {post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-base dark:border-accent-border bg-gradient-to-r from-surface-sub via-surface-muted to-surface-strong dark:from-surface dark:via-surface-sub dark:to-[var(--accent-dark)] px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base"
        >
          {t(locale, "링크 열기", "Open Link")}
        </a>
      ) : null}

      {fileDownloadUrl ? (
        <a
          href={fileDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-base dark:border-border-base/60 bg-surface-strong dark:bg-highlight-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base"
        >
          {post.fileName ?? t(locale, "파일 열기", "Open File")}
        </a>
      ) : null}

      {/* 게시글 공감 기능 */}
      <PostReaction
        postId={postId}
        reactions={postReactionsList}
        canInteract={true}
        togglePostReactionAction={toggleGuestPostReactionAction}
      />

      <CommentThread
        postId={postId}
        comments={commentItems}
        canInteract={true}
        labels={{
          title: t(locale, "댓글", "Comments"),
          prompt: t(locale, "댓글을 입력해 주세요.", "Write a comment"),
          submit: t(locale, "댓글 작성", "Add Comment"),
          reply: t(locale, "답글 달기", "Reply"),
          replyPlaceholder: t(locale, "답글을 입력해 주세요.", "Write a reply"),
          replySubmit: t(locale, "답글 게시", "Post Reply"),
          edit: t(locale, "댓글 수정", "Edit Comment"),
          delete: t(locale, "댓글 삭제", "Delete Comment"),
          save: t(locale, "저장하기", "Save"),
          cancel: t(locale, "취소", "Cancel"),
          noComments: t(locale, "아직 댓글이 없습니다.", "No comments yet."),
          loginToComment: t(locale, "댓글을 작성할 수 있는 권한이 없습니다.", "You are not allowed to comment."),
        }}
        addCommentAction={boundAddCommentAction}
        addReplyAction={boundAddReplyAction}
        updateCommentAction={boundUpdateCommentAction}
        deleteCommentAction={boundDeleteCommentAction}
        toggleCommentReactionAction={toggleGuestCommentReactionAction}
      />

      <div className="flex items-center gap-3">
        <Link
          href="/guest"
          className="inline-flex rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
        >
          {t(locale, "목록으로 돌아가기", "Back to List")}
        </Link>
        {canManage ? (
          <Link
            href={`/guest/${post.id}/edit`}
            className="inline-flex rounded-full border border-accent-border bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-sub"
          >
            {t(locale, "수정하기", "Edit")}
          </Link>
        ) : null}
        {canManage ? (
          <form action={boundDeleteGuestPostAction}>
            <Button
              type="submit"
              className="inline-flex rounded-full border border-danger-border bg-danger-soft px-4 py-2 text-sm font-semibold text-danger-sub"
            >
              {t(locale, "삭제하기", "Delete")}
            </Button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
