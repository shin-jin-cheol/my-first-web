import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPostCommentByPostId,
  deletePostById,
  deletePostCommentById,
  getPostById,
  getPostCommentsByPostId,
  updatePostCommentById,
} from "@/lib/posts";
import { buildDownloadUrl } from "@/lib/download-url";
import { findCommentById } from "@/lib/comment-utils";
import { getSession, requireSession } from "@/lib/auth";
import { getCategoryLabel } from "@/lib/post-categories";
import { canManagePost, canManageComment } from "@/lib/permissions";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const [post, session, comments] = await Promise.all([
    getPostById(postId),
    getSession(),
    getPostCommentsByPostId(postId),
  ]);
  const canManagePostResult = canManagePost(session ?? null, post ?? { authorId: undefined });
  const fileDownloadUrl = post?.fileUrl ? buildDownloadUrl(post.fileUrl, post.fileName) : undefined;

  async function deletePostAction() {
    "use server";

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
      redirect(`/posts/${postId}?error=${encodeURIComponent("게시글 삭제에 실패했습니다.")}`);
    }

    revalidatePath("/", "page");
    revalidatePath("/posts", "page");
    redirect(`/posts?deleted=${Date.now()}`);
  }

  async function addCommentAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const content = String(formData.get("comment") ?? "").trim();

    if (!content) {
      redirect(`/posts/${postId}?comment=empty`);
    }

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

    revalidatePath(`/posts/${postId}`, "page");
    revalidatePath("/posts", "page");
    redirect(`/posts/${postId}?commented=${Date.now()}`);
  }

  async function updateCommentAction(formData: FormData) {
    "use server";

    const currentSessionPromise = requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);
    const content = String(formData.get("content") ?? "").trim();

    if (!commentId || !content) {
      redirect(`/posts/${postId}`);
    }

    const [currentSession, currentComments] = await Promise.all([
      currentSessionPromise,
      getPostCommentsByPostId(postId),
    ]);
    const targetComment = findCommentById(currentComments, commentId);
    const canManageCommentResult = targetComment ? canManageComment(currentSession, targetComment) : false;

    if (!canManageCommentResult) {
      redirect(`/posts/${postId}`);
    }

    await updatePostCommentById(postId, commentId, content);
    revalidatePath(`/posts/${postId}`, "page");
    revalidatePath("/posts", "page");
    redirect(`/posts/${postId}?comment-updated=${Date.now()}`);
  }

  async function deleteCommentAction(formData: FormData) {
    "use server";

    const currentSessionPromise = requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);

    if (!commentId) {
      redirect(`/posts/${postId}`);
    }

    const [currentSession, currentComments] = await Promise.all([
      currentSessionPromise,
      getPostCommentsByPostId(postId),
    ]);
    const targetComment = findCommentById(currentComments, commentId);
    const canManageCommentResult = targetComment ? canManageComment(currentSession, targetComment) : false;

    if (!canManageCommentResult) {
      redirect(`/posts/${postId}`);
    }

    const deleted = await deletePostCommentById(postId, commentId);
    if (!deleted) {
      redirect(`/posts/${postId}?error=${encodeURIComponent("댓글 삭제에 실패했습니다.")}`);
    }
    revalidatePath(`/posts/${postId}`, "page");
    revalidatePath("/posts", "page");
    redirect(`/posts/${postId}?comment-deleted=${Date.now()}`);
  }

  if (!post) {
    return (
      <div className="space-y-6 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-8 shadow-[0_0_12px_rgba(129,216,208,0.05)]">
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">게시글 상세</h1>
        <p className="text-text-muted dark:text-text-muted">게시글을 찾을 수 없습니다.</p>
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-6 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-8 shadow-[0_0_12px_rgba(129,216,208,0.05)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">Post Detail</p>
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-text-muted dark:text-text-subtle">
          <p>
            <strong>작성자:</strong> {post.author}
          </p>
          <p>
            <strong>카테고리:</strong> {getCategoryLabel(post.category)}
          </p>
          <p>
            <strong>날짜:</strong> {post.date}
          </p>
        </div>
      </header>

      <p className="leading-7 text-text-sub dark:text-text-muted">{post.content}</p>

      {post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-base dark:border-accent-border bg-gradient-to-r from-surface-sub via-surface-muted to-surface-strong dark:from-surface dark:via-surface-sub dark:to-[#2b6661] px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base shadow-[0_0_12px_rgba(129,216,208,0.08)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-surface-muted dark:bg-accent-sub shadow-[0_0_6px_rgba(129,216,208,0.25)]" />
          링크 열기
        </a>
      ) : null}

      {fileDownloadUrl ? (
        <a
          href={fileDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-base dark:border-border-base/60 bg-surface-strong dark:bg-highlight-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base shadow-[0_0_8px_rgba(129,216,208,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-surface-muted dark:hover:bg-highlight-soft"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-surface-muted dark:bg-text-sub shadow-[0_0_6px_rgba(129,216,208,0.25)]" />
          {post.fileName ?? "파일 열기"}
        </a>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-border-base dark:border-border-base/80 bg-surface-strong/70 dark:bg-surface-sub/40 p-5">
        <h2 className="text-lg font-bold text-text-sub dark:text-text-base">댓글</h2>

        <form action={addCommentAction} className="space-y-3">
          <textarea
            name="comment"
            required
            minLength={1}
            maxLength={500}
            rows={4}
            placeholder="댓글을 입력해 주세요."
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-3 py-2 text-sm text-text-sub dark:text-text-base outline-none ring-accent-border placeholder:text-text-muted focus:ring"
          />
          <button
            type="submit"
            className="inline-flex rounded-full border border-border-base dark:border-accent-border bg-surface-strong dark:bg-accent-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-accent-sub"
          >
            댓글 작성
          </button>
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
                          댓글 수정
                        </button>
                      </form>

                      <form action={deleteCommentAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-border-base dark:border-danger-border bg-surface-strong dark:bg-danger-soft px-4 py-1.5 text-sm font-semibold text-text-sub dark:text-danger-sub"
                        >
                          댓글 삭제
                        </button>
                      </form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-text-muted dark:text-text-subtle">아직 댓글이 없습니다.</p>
        )}
      </section>

      <div className="flex items-center gap-3">
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
        >
          목록으로 돌아가기
        </Link>
        {canManagePostResult ? (
          <Link
            href={`/posts/${post.id}/edit`}
            className="inline-flex rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_12px_rgba(129,216,208,0.12)] transition hover:-translate-y-0.5 hover:bg-[#96e1da]"
          >
            수정하기
          </Link>
        ) : null}
        {canManagePostResult ? (
          <form action={deletePostAction}>
            <button
              type="submit"
              className="inline-flex rounded-full border border-border-base dark:border-danger-border bg-surface-strong dark:bg-danger-soft px-4 py-2 text-sm font-semibold text-text-sub dark:text-danger-sub transition hover:bg-surface-muted dark:hover:bg-danger-soft"
            >
              삭제하기
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
