import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addGuestPost, deleteGuestPostById, getGuestPosts } from "@/lib/guest-posts";
import { requireSession } from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";
import Link from "next/link";

type GuestBoardPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function GuestBoardPage({ searchParams }: GuestBoardPageProps) {
  const locale = await getLocale();
  const session = await requireSession();
  const posts = await getGuestPosts();
  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";

  async function createGuestPostAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    if (currentSession.role !== "member") {
      return;
    }

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();

    if (!title || !content) {
      return;
    }

    await addGuestPost({
      title,
      content,
      authorId: currentSession.userId,
    });

    revalidatePath("/guest");
    redirect("/guest");
  }

  async function deleteGuestPostAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    if (currentSession.role !== "owner") {
      return;
    }

    const postId = Number(formData.get("postId") ?? 0);
    if (!postId) {
      return;
    }

    await deleteGuestPostById(postId);
    revalidatePath("/guest");
    redirect("/guest");
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Guest Board</p>
        <h1 className="text-4xl font-extrabold text-zinc-100 drop-shadow-[0_0_12px_rgba(129,216,208,0.3)]">{t(locale, "게스트 게시판", "Guest Board")}</h1>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {session.role === "member" ? (
        <div className="space-y-5">
          <form
            action={createGuestPostAction}
            className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-800 p-6 shadow-[0_0_22px_rgba(129,216,208,0.12)]"
          >
            <div className="space-y-2">
              <label htmlFor="guest-title" className="text-sm text-zinc-200">제목</label>

              <input
                id="guest-title"
                name="title"
                required
                className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="guest-content" className="text-sm text-zinc-200">내용</label>
              <textarea
                id="guest-content"
                name="content"
                required
                rows={5}
                className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none focus:border-[#81d8d0]"
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_16px_rgba(129,216,208,0.5)]"
            >
              {t(locale, "게스트 글 작성", "Write Guest Post")}
            </button>
          </form>
          <Link
            href="/guest/account"
            className="inline-flex rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
          >
            {t(locale, "비밀번호 변경 / 회원탈퇴", "Password / Account Settings")}
          </Link>
          </div>
      ) : (
        <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
          {t(locale, "주인 계정으로 접속 중입니다. 회원이 작성한 게스트 게시글을 관리할 수 있습니다.", "You are logged in as owner and can manage guest posts.")}
        </p>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-zinc-400">{t(locale, "아직 게스트 게시글이 없습니다.", "There are no guest posts yet.")}</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-800 p-5">
              <h2 className="text-xl font-bold text-zinc-100">{post.title}</h2>
              <p className="text-zinc-300">{post.content}</p>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <p>{t(locale, "작성자", "Author")}: {post.authorId}</p>
                <p>{post.date}</p>
              </div>

              {session.role === "owner" ? (
                <form action={deleteGuestPostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-400/60 bg-red-500/20 px-4 py-1.5 text-sm font-semibold text-red-300 hover:bg-red-500/30"
                  >
                    {t(locale, "삭제하기", "Delete")}
                  </button>
                </form>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
