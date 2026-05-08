import Link from "next/link";
import {
  getPostById,
  getPostCommentsByPostId,
} from "@/lib/posts";
import { buildDownloadUrl } from "@/lib/download-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth";
import { getCategoryLabel } from "@/lib/post-categories";
import { canManagePost, canManageComment } from "@/lib/permissions";
import { getLocale, tk } from "@/lib/i18n";
import { addCommentAction, deleteCommentAction, deletePostAction, updateCommentAction } from "@/app/posts/actions";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const [locale, resolvedParams] = await Promise.all([getLocale(), params]);
  const { id } = resolvedParams;
  const postId = Number(id);
  const [post, session, comments] = await Promise.all([
    getPostById(postId),
    getSession(),
    getPostCommentsByPostId(postId),
  ]);
  const canManagePostResult = canManagePost(session ?? null, post ?? { authorId: undefined });
  const fileDownloadUrl = post?.fileUrl ? buildDownloadUrl(post.fileUrl, post.fileName) : undefined;

  const boundDeletePostAction = deletePostAction.bind(null, postId);
  const boundAddCommentAction = addCommentAction.bind(null, postId);
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

      <section className="space-y-4 rounded-2xl border border-border-base dark:border-border-base/80 bg-surface-strong/70 dark:bg-surface-sub/40 p-5">
        <h2 className="text-lg font-bold text-text-sub dark:text-text-base">{tk(locale, "comments")}</h2>

        <form action={boundAddCommentAction} className="space-y-3">
          <textarea
            name="comment"
            required
            minLength={1}
            maxLength={500}
            rows={4}
            placeholder={tk(locale, "writeComment")}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-3 py-2 text-sm text-text-sub dark:text-text-base outline-none ring-accent-border placeholder:text-text-muted focus:ring"
          />
          <Button
            type="submit"
            className="inline-flex rounded-full border border-border-base dark:border-accent-border bg-surface-strong dark:bg-accent-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-accent-sub"
          >
            {tk(locale, "addComment")}
          </Button>
        </form>

        {comments.length > 0 ? (
          <ul className="space-y-3">
            {comments.map((comment) => {
              const isCommentManageable = canManageComment(session ?? null, comment);

              return (
                <li key={comment.id} className="rounded-xl border border-border-base dark:border-border-base bg-surface-sub/90 dark:bg-surface-strong/80 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted dark:text-text-subtle">
                    <p className="font-semibold text-text-sub dark:text-text-sub">{comment.authorName}</p>
                    <p>{comment.dateTime}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-sub dark:text-text-muted">{comment.content}</p>

                  {isCommentManageable ? (
                    <div className="mt-3 space-y-2">
                      <form action={boundUpdateCommentAction} className="space-y-2">
                        <Input type="hidden" name="commentId" value={comment.id} className="hidden" />
                        <textarea
                          name="content"
                          defaultValue={comment.content}
                          required
                          minLength={1}
                          maxLength={500}
                          rows={3}
                          className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-3 py-2 text-sm text-text-sub dark:text-text-base outline-none ring-accent-border focus:ring"
                        />
                        <Button
                          type="submit"
                          className="rounded-full border border-border-base dark:border-accent-border bg-surface-strong dark:bg-accent-soft px-4 py-1.5 text-sm font-semibold text-text-sub dark:text-accent-sub"
                        >
                          {tk(locale, "editComment")}
                        </Button>
                      </form>

                      <form action={boundDeleteCommentAction}>
                        <Input type="hidden" name="commentId" value={comment.id} className="hidden" />
                        <Button
                          type="submit"
                          className="rounded-full border border-border-base dark:border-danger-border bg-surface-strong dark:bg-danger-soft px-4 py-1.5 text-sm font-semibold text-text-sub dark:text-danger-sub"
                        >
                          {tk(locale, "deleteComment")}
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-text-muted dark:text-text-subtle">{tk(locale, "noComments")}</p>
        )}
      </section>

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
