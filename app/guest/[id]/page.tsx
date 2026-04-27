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
import { getLocale, t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";
import { getCategoryLabel } from "@/lib/post-categories";

type GuestPostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestPostDetailPage({ params }: GuestPostDetailPageProps) {
  const locale = await getLocale();
  const session = await requireSession();
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    redirect("/guest");
  }

  const post = await getGuestPostById(postId);
  if (!post) {
    redirect("/guest");
  }
  const fileDownloadUrl = post.fileUrl
    ? `${post.fileUrl}${post.fileUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(post.fileName ?? "attachment")}`
    : undefined;

  const canManage = session.role === "owner" || (session.role === "member" && post.authorId === session.userId);

  async function deleteGuestPostAction() {
    "use server";

    const currentSession = await requireSession();
    const currentPost = await getGuestPostById(postId);
    const canDelete =
      currentSession.role === "owner" ||
      (currentSession.role === "member" && currentPost?.authorId === currentSession.userId);

    if (!canDelete) {
      redirect(`/guest/${postId}`);
    }

    await deleteGuestPostById(postId);
    revalidatePath("/guest", "page");
    revalidatePath("/posts", "page");
    redirect(`/guest?deleted=${Date.now()}`);
  }

  async function addCommentAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const content = String(formData.get("comment") ?? "").trim();

    if (!content) {
      redirect(`/guest/${postId}?comment=empty`);
    }

    const currentPost = await getGuestPostById(postId);
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

    const currentSession = await requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);
    const content = String(formData.get("content") ?? "").trim();

    if (!commentId || !content) {
      redirect(`/guest/${postId}`);
    }

    const currentPost = await getGuestPostById(postId);
    const targetComment = currentPost?.comments?.find((comment) => comment.id === commentId);
    const canManageComment =
      currentSession.role === "owner" || targetComment?.authorId === currentSession.userId;

    if (!canManageComment) {
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

    const currentSession = await requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);

    if (!commentId) {
      redirect(`/guest/${postId}`);
    }

    const currentPost = await getGuestPostById(postId);
    const targetComment = currentPost?.comments?.find((comment) => comment.id === commentId);
    const canManageComment =
      currentSession.role === "owner" || targetComment?.authorId === currentSession.userId;

    if (!canManageComment) {
      redirect(`/guest/${postId}`);
    }

    await deleteGuestCommentById(postId, commentId);
    revalidatePath(`/guest/${postId}`, "page");
    revalidatePath("/guest", "page");
    revalidatePath("/posts", "page");
    redirect(`/guest/${postId}?comment-deleted=${Date.now()}`);
  }

  return (
    <article className="space-y-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-8 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Guest Detail</p>
        <h1 className="text-3xl font-extrabold text-zinc-700 dark:text-zinc-100">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
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

      <p className="leading-7 text-zinc-600 dark:text-zinc-300">{post.content}</p>

      {post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-400 dark:border-cyan-500/50 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-400 dark:from-zinc-900 dark:via-zinc-800 dark:to-[#2b6661] px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-100"
        >
          {t(locale, "링크 열기", "Open Link")}
        </a>
      ) : null}

      {fileDownloadUrl ? (
        <a
          href={fileDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-400 dark:border-zinc-500/60 bg-zinc-200 dark:bg-white/10 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-100"
        >
          {post.fileName ?? t(locale, "파일 열기", "Open File")}
        </a>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-200/70 dark:bg-zinc-900/40 p-5">
        <h2 className="text-lg font-bold text-zinc-700 dark:text-zinc-100">{t(locale, "댓글", "Comments")}</h2>

        <form action={addCommentAction} className="space-y-3">
          <textarea
            name="comment"
            required
            minLength={1}
            maxLength={500}
            rows={4}
            placeholder={t(locale, "댓글을 입력해 주세요.", "Write a comment")}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-100 outline-none ring-cyan-400/60 placeholder:text-zinc-500 focus:ring"
          />
          <button
            type="submit"
            className="inline-flex rounded-full border border-zinc-400 dark:border-cyan-500/60 bg-zinc-200 dark:bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-cyan-100"
          >
            {t(locale, "댓글 작성", "Add Comment")}
          </button>
        </form>

        {post.comments && post.comments.length > 0 ? (
          <ul className="space-y-3">
            {post.comments.map((comment) => (
              <li key={comment.id} className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100/90 dark:bg-zinc-800/80 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-200">{comment.authorName}</p>
                  <p>{comment.dateTime}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">{comment.content}</p>

                {session.role === "owner" || session.userId === comment.authorId ? (
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
                        className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-100 outline-none ring-cyan-400/60 focus:ring"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-zinc-400 dark:border-cyan-500/50 bg-zinc-200 dark:bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-zinc-700 dark:text-cyan-200"
                      >
                        {t(locale, "댓글 수정", "Edit Comment")}
                      </button>
                    </form>

                    <form action={deleteCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-zinc-400 dark:border-red-400/60 bg-zinc-200 dark:bg-red-500/20 px-4 py-1.5 text-sm font-semibold text-zinc-700 dark:text-red-300"
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(locale, "아직 댓글이 없습니다.", "No comments yet.")}</p>
        )}
      </section>

      <div className="flex items-center gap-3">
        <Link
          href="/guest"
          className="inline-flex rounded-full border border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-100 transition hover:bg-zinc-300 dark:hover:bg-zinc-600"
        >
          {t(locale, "목록으로 돌아가기", "Back to List")}
        </Link>
        {canManage ? (
          <Link
            href={`/guest/${post.id}/edit`}
            className="inline-flex rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200"
          >
            {t(locale, "수정하기", "Edit")}
          </Link>
        ) : null}
        {canManage ? (
          <form action={deleteGuestPostAction}>
            <button
              type="submit"
              className="inline-flex rounded-full border border-red-400/60 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300"
            >
              {t(locale, "삭제하기", "Delete")}
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
