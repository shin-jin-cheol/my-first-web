import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGuestPostById, updateGuestPostById } from "@/lib/guest-posts";
import { requireSession } from "@/lib/auth";
import { getCategoryLabel, GUEST_POST_CATEGORIES } from "@/lib/post-categories";
import { getLocale, t } from "@/lib/i18n";
import { canManagePost } from "@/lib/permissions";
import { safeDecodeURIComponent } from "@/lib/safe-decode";
import { normalizeCategory } from "@/lib/utils";

type EditGuestPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditGuestPostPage({ params, searchParams }: EditGuestPostPageProps) {
  const locale = await getLocale();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const errorMessage = query.error ? safeDecodeURIComponent(query.error) : "";
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    redirect("/guest");
  }

  const post = await getGuestPostById(postId);
  if (!post) {
    redirect("/guest");
  }

  const canEdit = canManagePost(session, post);
  if (!canEdit) {
    redirect("/guest");
  }

  async function updateGuestPostAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const currentPost = await getGuestPostById(postId);
    const canUpdate = canManagePost(currentSession, currentPost ?? { authorId: undefined });

    if (!canUpdate) {
      redirect("/guest");
    }

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const category = String(formData.get("category") ?? "study").trim();

    if (!title) {
      const message = encodeURIComponent("제목을 입력해 주세요.");
      redirect(`/guest/${postId}/edit?error=${message}`);
    }

    if (!content) {
      const message = encodeURIComponent("내용을 입력해 주세요.");
      redirect(`/guest/${postId}/edit?error=${message}`);
    }

    await updateGuestPostById(postId, {
      title,
      content,
      category: normalizeCategory(category, 'guest'),
    });

    revalidatePath("/guest", "page");
    revalidatePath("/posts", "page");
    redirect(`/guest?updated=${Date.now()}`);
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
          Edit
        </p>
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base">
          {t(locale, "게스트 글 수정", "Edit Guest Post")}
        </h1>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <form
        action={updateGuestPostAction}
        className="space-y-5 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-6"
      >
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {t(locale, "카테고리", "Category")}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={post.category}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          >
            {GUEST_POST_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {t(locale, "제목", "Title")}
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={post.title}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {t(locale, "내용", "Content")}
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={post.content}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-surface-strong dark:bg-surface-sub px-4 py-3 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-text-base"
          >
            {t(locale, "저장하기", "Save")}
          </button>
          <Link
            href="/guest"
            className="rounded-full border border-zinc-400 dark:border-zinc-500 bg-surface-strong dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-zinc-600"
          >
            {t(locale, "취소", "Cancel")}
          </Link>
        </div>
      </form>
    </section>
  );
}
