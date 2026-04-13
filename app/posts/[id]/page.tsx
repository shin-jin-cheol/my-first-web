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
import { getSession, requireSession } from "@/lib/auth";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const post = await getPostById(postId);
  const session = await getSession();
  const comments = await getPostCommentsByPostId(postId);
  const canManagePost =
    session?.role === "owner" || (session?.role === "member" && post?.authorId === session.userId);
  const fileDownloadUrl = post?.fileUrl
    ? `${post.fileUrl}${post.fileUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(post.fileName ?? "attachment")}`
    : undefined;

  async function deletePostAction() {
    "use server";

    const currentSession = await getSession();
    const currentPost = await getPostById(postId);

    const canDelete =
      currentSession?.role === "owner" ||
      (currentSession?.role === "member" && currentPost?.authorId === currentSession.userId);

    if (!canDelete) {
      redirect(`/posts/${postId}`);
    }

    await deletePostById(postId);
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

    const currentSession = await requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);
    const content = String(formData.get("content") ?? "").trim();

    if (!commentId || !content) {
      redirect(`/posts/${postId}`);
    }

    const currentComments = await getPostCommentsByPostId(postId);
    const targetComment = currentComments.find((comment) => comment.id === commentId);
    const canManageComment =
      currentSession.role === "owner" || targetComment?.authorId === currentSession.userId;

    if (!canManageComment) {
      redirect(`/posts/${postId}`);
    }

    await updatePostCommentById(postId, commentId, content);
    revalidatePath(`/posts/${postId}`, "page");
    revalidatePath("/posts", "page");
    redirect(`/posts/${postId}?comment-updated=${Date.now()}`);
  }

  async function deleteCommentAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const commentId = Number(formData.get("commentId") ?? 0);

    if (!commentId) {
      redirect(`/posts/${postId}`);
    }

    const currentComments = await getPostCommentsByPostId(postId);
    const targetComment = currentComments.find((comment) => comment.id === commentId);
    const canManageComment =
      currentSession.role === "owner" || targetComment?.authorId === currentSession.userId;

    if (!canManageComment) {
      redirect(`/posts/${postId}`);
    }

    await deletePostCommentById(postId, commentId);
    revalidatePath(`/posts/${postId}`, "page");
    revalidatePath("/posts", "page");
    redirect(`/posts/${postId}?comment-deleted=${Date.now()}`);
  }

  if (!post) {
    return (
      <div className="space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-8 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
        <h1 className="text-3xl font-extrabold text-zinc-100">게시글 상세</h1>
        <p className="text-zinc-300">게시글을 찾을 수 없습니다</p>
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-600"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-8 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Post Detail</p>
        <h1 className="text-3xl font-extrabold text-zinc-100">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <p>
            <strong>작성자:</strong> {post.author}
          </p>
          <p>
            <strong>날짜:</strong> {post.date}
          </p>
        </div>
      </header>

      <p className="leading-7 text-zinc-300">{post.content}</p>

      {post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/50 bg-gradient-to-r from-zinc-900 via-zinc-800 to-[#2b6661] px-4 py-2 text-sm font-semibold text-zinc-100 shadow-[0_0_20px_rgba(129,216,208,0.35)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[#81d8d0] shadow-[0_0_10px_rgba(129,216,208,0.8)]" />
          링크 열기
        </a>
      ) : null}

      {fileDownloadUrl ? (
        <a
          href={fileDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-500/60 bg-white/10 px-4 py-2 text-sm font-semibold text-zinc-100 shadow-[0_0_14px_rgba(129,216,208,0.25)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-zinc-200" />
          파일 열기
        </a>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-zinc-700/80 bg-zinc-900/40 p-5">
        <h2 className="text-lg font-bold text-zinc-100">댓글</h2>

        <form action={addCommentAction} className="space-y-3">
          <textarea
            name="comment"
            required
            minLength={1}
            maxLength={500}
            rows={4}
            placeholder="댓글을 입력하세요"
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-400/60 placeholder:text-zinc-500 focus:ring"
          />
          <button
            type="submit"
            className="inline-flex rounded-full border border-cyan-500/60 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100"
          >
            댓글 작성
          </button>
        </form>

        {comments.length > 0 ? (
          <ul className="space-y-3">
            {comments.map((comment) => {
              const canManageComment =
                session?.role === "owner" || session?.userId === comment.authorId;

              return (
                <li key={comment.id} className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                    <p className="font-semibold text-zinc-200">{comment.authorName}</p>
                    <p>{comment.dateTime}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{comment.content}</p>

                  {canManageComment ? (
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
                          className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-400/60 focus:ring"
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-200"
                        >
                          댓글 수정
                        </button>
                      </form>

                      <form action={deleteCommentAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-400/60 bg-red-500/20 px-4 py-1.5 text-sm font-semibold text-red-300"
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
          <p className="text-sm text-zinc-400">아직 댓글이 없습니다.</p>
        )}
      </section>

      <div className="flex items-center gap-3">
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-600"
        >
          목록으로 돌아가기
        </Link>
        {canManagePost ? (
          <Link
            href={`/posts/${post.id}/edit`}
            className="inline-flex rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.5)] transition hover:-translate-y-0.5 hover:bg-[#96e1da]"
          >
            수정하기
          </Link>
        ) : null}
        {canManagePost ? (
          <form action={deletePostAction}>
            <button
              type="submit"
              className="inline-flex rounded-full border border-red-400/60 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30"
            >
              삭제하기
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
