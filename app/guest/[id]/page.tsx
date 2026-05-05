import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addGuestCommentById,
  deleteGuestCommentById,
  deleteGuestPostById,
  getGuestPostById,
  updateGuestCommentById,
} from "@/lib/guest-posts";
import { buildDownloadUrl } from "@/lib/download-url";
import { findCommentById } from "@/lib/comment-utils";
import { getLocale, t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";
import { getCategoryLabel } from "@/lib/post-categories";
import { canManagePost, canManageComment } from "@/lib/permissions";

type GuestPostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestPostDetailPage({ params }: GuestPostDetailPageProps) {
  const [locale, session, resolvedParams] = await Promise.all([
    getLocale(),
    requireSession(),
    params,
  ]);
  const { id } = resolvedParams;
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    redirect("/guest");
  }

  const post = await getGuestPostById(postId);
  if (!post) {
    redirect("/guest");
  }
  const fileDownloadUrl = post.fileUrl ? buildDownloadUrl(post.fileUrl, post.fileName) : undefined;

  const canManage = canManagePost(session, post);

  async function deleteGuestPostAction() {
    "use server";

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

  async function addCommentAction(formData: FormData) {
    "use server";

    const currentSessionPromise = requireSession();
    const content = String(formData.get("comment") ?? "").trim();

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

  async function updateCommentAction(formData: FormData) {
    "use server";

    const currentSessionPromise = requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);
    const content = String(formData.get("content") ?? "").trim();

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

  async function deleteCommentAction(formData: FormData) {
    "use server";

    const currentSessionPromise = requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);

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

  return (
    <article className="space-y-6 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-8 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">Guest Detail</p>
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-text-muted dark:text-text-subtle">
          <p>
            <strong>{t(locale, "작성자", "Author")}:</strong> {post.authorName || post.authorId}
          </p>
          <p>
            <strong>{t(locale, "카테고리", "Category")}:</strong> {getCategoryLabel(post.category)}
          </p>
          <p>
            <strong>{t(locale, "날짜", "Date")}:</strong> {post.date}
          </p>
        </div>
      </header>

      <p className="leading-7 text-text-sub dark:text-text-muted">{post.content}</p>

      {post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-base dark:border-accent-border bg-gradient-to-r from-surface-sub via-surface-muted to-surface-strong dark:from-surface dark:via-surface-sub dark:to-[#2b6661] px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base"
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

      <section className="space-y-4 rounded-2xl border border-border-base dark:border-border-sub/80 bg-surface-strong/70 dark:bg-surface/40 p-5">
        <h2 className="text-lg font-bold text-text-sub dark:text-text-base">{t(locale, "댓글", "Comments")}</h2>

        <form action={addCommentAction} className="space-y-3">
          <textarea
            name="comment"
            required
            minLength={1}
            maxLength={500}
            rows={4}
            placeholder={t(locale, "댓글을 입력해 주세요.", "Write a comment")}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-3 py-2 text-sm text-text-sub dark:text-text-base outline-none ring-accent-border placeholder:text-text-muted focus:ring"
          />
          <button
            type="submit"
            className="inline-flex rounded-full border border-border-base dark:border-accent-border bg-surface-strong dark:bg-accent-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-accent-sub"
          >
            {t(locale, "댓글 작성", "Add Comment")}
          </button>
        </form>

        {post.comments && post.comments.length > 0 ? (
          <ul className="space-y-3">
            {post.comments.map((comment) => (
                <li key={comment.id} className="rounded-xl border border-border-base dark:border-border-base bg-surface-sub/90 dark:bg-surface-strong/80 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted dark:text-text-subtle">
                    <p className="font-semibold text-text-sub dark:text-text-sub">{comment.authorName}</p>
                  <p>{comment.dateTime}</p>
                </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-sub dark:text-text-muted">{comment.content}</p>

                {canManageComment(session, comment) ? (
                  <div className="mt-3 space-y-2">
                    <form action={updateCommentAction} className="space-y-2">
                      <input type="hidden" name="commentId" value={comment.id} />
                      <textarea
                        name="content"
                        defaultValue={comment.content}
                        required
                        minLength={1}
                        maxLength={500}
                        rows={3}
                        className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-3 py-2 text-sm text-text-sub dark:text-text-base outline-none ring-accent-border focus:ring"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-border-base dark:border-accent-border bg-surface-strong dark:bg-accent-soft px-4 py-1.5 text-sm font-semibold text-text-sub dark:text-accent-sub"
                      >
                        {t(locale, "댓글 수정", "Edit Comment")}
                      </button>
                    </form>

                    <form action={deleteCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-border-base dark:border-danger-border bg-surface-strong dark:bg-danger-soft px-4 py-1.5 text-sm font-semibold text-text-sub dark:text-danger-sub"
                      >
                        {t(locale, "댓글 삭제", "Delete Comment")}
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted dark:text-text-subtle">{t(locale, "아직 댓글이 없습니다.", "No comments yet.")}</p>
        )}
      </section>

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
          <form action={deleteGuestPostAction}>
            <button
              type="submit"
              className="inline-flex rounded-full border border-danger-border bg-danger-soft px-4 py-2 text-sm font-semibold text-danger-sub"
            >
              {t(locale, "삭제하기", "Delete")}
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
