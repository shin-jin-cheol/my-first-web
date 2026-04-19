import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGuestPostById, updateGuestPostById } from "@/lib/guest-posts";
import { getLocale, t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";

type EditGuestPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditGuestPostPage({ params, searchParams }: EditGuestPostPageProps) {
  const locale = await getLocale();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const errorMessage = query.error ? decodeURIComponent(query.error) : "";
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    redirect("/guest");
  }

  const post = await getGuestPostById(postId);

  if (!post) {
    redirect("/guest");
  }

  const canEdit = session.role === "owner" || (session.role === "member" && post.authorId === session.userId);
  if (!canEdit) {
    redirect("/guest");
  }

  async function updateGuestPostAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const currentPost = await getGuestPostById(postId);
    const canUpdate =
      currentSession.role === "owner" ||
      (currentSession.role === "member" && currentPost?.authorId === currentSession.userId);

    if (!canUpdate) {
      redirect("/guest");
    }

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();

    if (!title) {
      const message = encodeURIComponent("제목을 입력하세요");
      redirect(`/guest/${postId}/edit?error=${message}`);
    }

    if (!content) {
      const message = encodeURIComponent("내용을 입력해 주세요.");
      redirect(`/guest/${postId}/edit?error=${message}`);
    }

    await updateGuestPostById(postId, { title, content });
    revalidatePath("/guest", "page");
    revalidatePath("/posts", "page");
    redirect(`/guest?updated=${Date.now()}`);
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Edit</p>
        <h1 className="text-4xl font-extrabold text-zinc-700 dark:text-zinc-100">{t(locale, "게스트 글 수정", "Edit Guest Post")}</h1>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</p>
      ) : null}

      <form action={updateGuestPostAction} className="space-y-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {t(locale, "제목", "Title")}
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={post.title}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {t(locale, "내용", "Content")}
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={post.content}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-3 text-zinc-700 dark:text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900"
          >
            {t(locale, "저장하기", "Save")}
          </button>
          <Link
            href="/guest"
            className="rounded-full border border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-100 transition hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            {t(locale, "취소", "Cancel")}
          </Link>
        </div>
      </form>
    </section>
  );
}
