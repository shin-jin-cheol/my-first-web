import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addGuestPost, deleteGuestPostById, getGuestPosts } from "@/lib/guest-posts";
import { requireSession } from "@/lib/auth";

export default async function GuestBoardPage() {
  const session = await requireSession();
  const posts = await getGuestPosts();

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
        <h1 className="text-4xl font-extrabold text-zinc-100 drop-shadow-[0_0_12px_rgba(129,216,208,0.3)]">guest</h1>
        <p className="text-zinc-300">
          회원은 글 작성만 가능하고, 주인 계정은 글 삭제 관리가 가능합니다.
        </p>
      </header>

      {session.role === "member" ? (
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
            guest 글 작성
          </button>
        </form>
      ) : (
        <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
          주인 계정으로 접속 중입니다. 회원이 작성한 guest 게시글을 관리할 수 있습니다.
        </p>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-zinc-400">아직 guest 게시글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-800 p-5">
              <h2 className="text-xl font-bold text-zinc-100">{post.title}</h2>
              <p className="text-zinc-300">{post.content}</p>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <p>작성자: {post.authorId}</p>
                <p>{post.date}</p>
              </div>

              {session.role === "owner" ? (
                <form action={deleteGuestPostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-400/60 bg-red-500/20 px-4 py-1.5 text-sm font-semibold text-red-300 hover:bg-red-500/30"
                  >
                    삭제하기
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
