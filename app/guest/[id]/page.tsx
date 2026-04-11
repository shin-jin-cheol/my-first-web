import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteGuestPostById, getGuestPostById } from "@/lib/guest-posts";
import { getLocale, t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";

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

  return (
    <article className="space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-8 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Guest Detail</p>
        <h1 className="text-3xl font-extrabold text-zinc-100">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <p>
            <strong>{t(locale, "작성자", "Author")}:</strong> {post.authorName || post.authorId}
          </p>
          <p>
            <strong>{t(locale, "날짜", "Date")}:</strong> {post.date}
          </p>
        </div>
      </header>

      <p className="leading-7 text-zinc-300">{post.content}</p>

      {post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/50 bg-gradient-to-r from-zinc-900 via-zinc-800 to-[#2b6661] px-4 py-2 text-sm font-semibold text-zinc-100"
        >
          {t(locale, "링크 열기", "Open Link")}
        </a>
      ) : null}

      {post.fileUrl ? (
        <a
          href={post.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-500/60 bg-white/10 px-4 py-2 text-sm font-semibold text-zinc-100"
        >
          {post.fileName ?? t(locale, "파일 열기", "Open File")}
        </a>
      ) : null}

      <div className="flex items-center gap-3">
        <Link
          href="/guest"
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-600"
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
