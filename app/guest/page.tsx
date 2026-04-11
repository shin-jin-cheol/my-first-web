import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addGuestPost, deleteGuestPostById, getGuestPosts } from "@/lib/guest-posts";
import { changeMemberPassword, clearSession, deleteMemberAccount, requireSession } from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";

type GuestBoardPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function GuestBoardPage({ searchParams }: GuestBoardPageProps) {
  const locale = await getLocale();
  const session = await requireSession();
  const posts = await getGuestPosts();
  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";
  const successKey = params.success ?? "";
  const successMessage =
    successKey === "password"
      ? t(locale, "비밀번호가 변경되었습니다.", "Password changed successfully.")
      : successKey === "withdraw"
        ? t(locale, "회원 탈퇴가 완료되었습니다.", "Your account has been deleted.")
        : "";

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

  async function changePasswordAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    if (currentSession.role !== "member") {
      return;
    }

    const currentPassword = String(formData.get("currentPassword") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();

    const result = await changeMemberPassword(currentSession.userId, currentPassword, newPassword);
    if (!result.ok) {
      const message = encodeURIComponent(result.message ?? "비밀번호 변경에 실패했습니다.");
      redirect(`/guest?error=${message}`);
    }

    redirect("/guest?success=password");
  }

  async function withdrawAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    if (currentSession.role !== "member") {
      return;
    }

    const password = String(formData.get("withdrawPassword") ?? "").trim();
    const result = await deleteMemberAccount(currentSession.userId, password);

    if (!result.ok) {
      const message = encodeURIComponent(result.message ?? "회원 탈퇴에 실패했습니다.");
      redirect(`/guest?error=${message}`);
    }

    await clearSession();
    redirect("/auth/login?withdraw=1");
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

      {successMessage ? (
        <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
          {successMessage}
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

          <form
            action={changePasswordAction}
            className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-800 p-6"
          >
            <h2 className="text-lg font-bold text-zinc-100">{t(locale, "비밀번호 변경", "Change Password")}</h2>
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm text-zinc-200">{t(locale, "현재 비밀번호", "Current Password")}</label>
              <input
                id="current-password"
                name="currentPassword"
                type="password"
                required
                className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm text-zinc-200">{t(locale, "새 비밀번호", "New Password")}</label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                required
                className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200"
            >
              {t(locale, "비밀번호 변경", "Change Password")}
            </button>
          </form>

          <form
            action={withdrawAction}
            className="space-y-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-6"
          >
            <h2 className="text-lg font-bold text-red-200">{t(locale, "회원 탈퇴", "Delete Account")}</h2>
            <div className="space-y-2">
              <label htmlFor="withdraw-password" className="text-sm text-red-200">{t(locale, "비밀번호 확인", "Confirm Password")}</label>
              <input
                id="withdraw-password"
                name="withdrawPassword"
                type="password"
                required
                className="w-full rounded-xl border border-red-400/60 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-red-400/70 bg-red-500/30 px-4 py-2 text-sm font-semibold text-red-100"
            >
              {t(locale, "회원 탈퇴하기", "Delete Account")}
            </button>
          </form>
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
