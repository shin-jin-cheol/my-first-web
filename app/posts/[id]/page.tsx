import Link from "next/link";
import {
  getPostById,
  getPostCommentsByPostId,
  getPostCommentReactions,
  getPostReactions,
  incrementPostViews,
} from "@/lib/posts";
import { buildDownloadUrl } from "@/lib/download-url";
import { Button } from "@/components/ui/button";
import { PostReaction } from "@/components/post-reaction";
import { getSession } from "@/lib/auth";
import { getCategoryLabel } from "@/lib/post-categories";
import { canManagePost, canManageComment } from "@/lib/permissions";
import { getLocale, tk, t } from "@/lib/i18n";
import {
  addCommentAction,
  addReplyAction,
  deleteCommentAction,
  deletePostAction,
  updateCommentAction,
  togglePostCommentReactionAction,
  togglePostReactionAction,
} from "@/app/posts/actions";
import { CommentThread, type CommentThreadItem } from "@/components/comment-thread";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const [locale, resolvedParams] = await Promise.all([getLocale(), params]);
  const { id } = resolvedParams;
  const postId = Number(id);

  await incrementPostViews(postId);

  const [post, session, comments, postReactions] = await Promise.all([
    getPostById(postId),
    getSession(),
    getPostCommentsByPostId(postId),
    getPostReactions(postId),
  ]);
  const canManagePostResult = canManagePost(session ?? null, post ?? { authorId: undefined });
  const fileDownloadUrl = post?.fileUrl ? buildDownloadUrl(post.fileUrl, post.fileName) : undefined;
  const canInteract = Boolean(session);

  // 게시글 반응 데이터 집계
  const postReactionMap = new Map<string, { count: number; userReacted: boolean }>();
  for (const reaction of postReactions) {
    const existing = postReactionMap.get(reaction.emoji) || { count: 0, userReacted: false };
    postReactionMap.set(reaction.emoji, {
      count: existing.count + 1,
      userReacted: reaction.memberId === session?.userId ? true : existing.userReacted,
    });
  }
  const postReactionsList = Array.from(postReactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    ...data,
  }));

  // 각 댓글의 반응 데이터 조회
  const commentReactionMap = new Map<number, Array<{ emoji: string; count: number; userReacted: boolean }>>();
  for (const comment of comments) {
    const reactions = await getPostCommentReactions(comment.id);
    const reactionsByEmoji = new Map<string, { count: number; userReacted: boolean }>();
    
    for (const reaction of reactions) {
      const existing = reactionsByEmoji.get(reaction.emoji) || { count: 0, userReacted: false };
      reactionsByEmoji.set(reaction.emoji, {
        count: existing.count + 1,
        userReacted: reaction.memberId === session?.userId ? true : existing.userReacted,
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

  const commentItems: CommentThreadItem[] = comments.map((comment) => ({
    ...comment,
    canManage: canManageComment(session ?? null, comment),
    reactions: commentReactionMap.get(comment.id),
  }));

  const boundDeletePostAction = deletePostAction.bind(null, postId);
  const boundAddCommentAction = addCommentAction.bind(null, postId);
  const boundAddReplyAction = addReplyAction.bind(null, postId);
  const boundUpdateCommentAction = updateCommentAction.bind(null, postId);
  const boundDeleteCommentAction = deleteCommentAction.bind(null, postId);

  if (!post) {
    return (
      <div className="space-y-6 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-8 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)]">
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">{tk(locale, "postDetailTitle")}</h1>
        <p className="text-text-muted dark:text-text-muted">{tk(locale, "postNotFound")}</p>
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
        >
          {tk(locale, "backToList")}
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-6 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-8 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">Post Detail</p>
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-text-muted dark:text-text-subtle">
          <p>
            <strong>{tk(locale, "author")}:</strong> {post.author}
          </p>
          <p>
            <strong>{tk(locale, "category")}:</strong> {getCategoryLabel(post.category)}
          </p>
          <p>
            <strong>{tk(locale, "date")}:</strong> {post.date}
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
          className="inline-flex items-center gap-2 rounded-full border border-border-base dark:border-accent-border bg-gradient-to-r from-surface-sub via-surface-muted to-surface-strong dark:from-surface dark:via-surface-sub dark:to-[var(--accent-dark)] px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-surface-muted dark:bg-accent-sub shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.25)]" />
          {tk(locale, "openLink")}
        </a>
      ) : null}

      {fileDownloadUrl ? (
        <a
          href={fileDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-base dark:border-border-base/60 bg-surface-strong dark:bg-highlight-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-surface-muted dark:hover:bg-highlight-soft"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-surface-muted dark:bg-text-sub shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.25)]" />
          {post.fileName ?? tk(locale, "openFile")}
        </a>
      ) : null}

      {/* 게시글 공감 기능 */}
      <PostReaction
        postId={postId}
        reactions={postReactionsList}
        canInteract={canInteract}
        togglePostReactionAction={togglePostReactionAction}
      />

      <CommentThread
        postId={postId}
        comments={commentItems}
        canInteract={canInteract}
        labels={{
          title: tk(locale, "comments"),
          prompt: t(locale, "댓글을 남기거나 답글을 달 수 있습니다.", "You can leave a comment or reply."),
          submit: tk(locale, "addComment"),
          reply: t(locale, "답글 달기", "Reply"),
          replyPlaceholder: t(locale, "답글을 입력해 주세요.", "Write a reply"),
          replySubmit: t(locale, "답글 게시", "Post Reply"),
          edit: tk(locale, "editComment"),
          delete: tk(locale, "deleteComment"),
          save: tk(locale, "save"),
          cancel: tk(locale, "cancel"),
          noComments: tk(locale, "noComments"),
          loginToComment: t(locale, "로그인 후 댓글을 작성할 수 있습니다.", "Please log in to comment."),
        }}
        addCommentAction={boundAddCommentAction}
        addReplyAction={boundAddReplyAction}
        updateCommentAction={boundUpdateCommentAction}
        deleteCommentAction={boundDeleteCommentAction}
        toggleCommentReactionAction={togglePostCommentReactionAction}
      />

      <div className="flex items-center gap-3">
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
        >
          {tk(locale, "backToList")}
        </Link>
        {canManagePostResult ? (
          <Link
            href={`/posts/${post.id}/edit`}
            className="inline-flex rounded-full border border-[var(--accent-light)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.12)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-light-sub)]"
          >
            {tk(locale, "edit")}
          </Link>
        ) : null}
        {canManagePostResult ? (
          <form action={boundDeletePostAction}>
            <Button
              type="submit"
              className="inline-flex rounded-full border border-border-base dark:border-danger-border bg-surface-strong dark:bg-danger-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-danger-sub transition hover:bg-surface-muted dark:hover:bg-danger-soft"
            >
              {tk(locale, "delete")}
            </Button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
