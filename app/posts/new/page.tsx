import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { safeDecodeURIComponent } from "@/lib/safe-decode";
import { BLOG_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { addPost } from "@/lib/posts";
import { isRedirectError } from "@/lib/redirect-error";
import { normalizeCategory, normalizeAttachment } from "@/lib/utils";



async function createPost(formData: FormData) {
  "use server";

  try {
    const session = await requireSession();
    if (session.role !== "owner") {
      redirect("/guest/new");
    }

    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const category = String(formData.get("category") ?? "study").trim();
    const linkUrl = String(formData.get("linkUrl") ?? "").trim();
    const attachmentFile = formData.get("attachment");

    if (!title) {
      redirect(`/posts/new?error=${encodeURIComponent("제목을 입력해 주세요.")}`);
    }

    if (!author || !content) {
      redirect(`/posts/new?error=${encodeURIComponent("작성자와 내용을 입력해 주세요.")}`);
    }

    await addPost({
      title,
      author,
      authorId: undefined,
      content,
      category: normalizeCategory(category, 'blog'),
      linkUrl,
      attachmentFile: normalizeAttachment(attachmentFile),
    });

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/guest");
    redirect("/posts");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "게시글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.";
    redirect(`/posts/new?error=${encodeURIComponent(message)}`);
  }
}

type NewPostPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  const session = await requireSession();
  if (session.role !== "owner") {
    redirect("/guest/new");
  }

  const params = await searchParams;
  const errorMessage = params.error ? safeDecodeURIComponent(params.error) : "";

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
          Write
        </p>
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base drop-shadow-[0_0_12px_rgba(129,216,208,0.35)]">
          블로그 글 쓰기
        </h1>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-sub">
          {errorMessage}
        </p>
      ) : null}

      <form
        action={createPost}
        className="space-y-5 rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-6 shadow-[0_0_28px_rgba(129,216,208,0.16)]"
      >
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-text-sub dark:text-text-sub">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            defaultValue="study"
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
          >
            {BLOG_POST_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-text-sub dark:text-text-sub">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="제목을 입력해 주세요."
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="text-sm font-medium text-text-sub dark:text-text-sub">
            작성자
          </label>
          <input
            id="author"
            name="author"
            type="text"
            required
            placeholder="작성자 이름"
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-text-sub dark:text-text-sub">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            placeholder="글 내용을 입력해 주세요."
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-3 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkUrl" className="text-sm font-medium text-text-sub dark:text-text-sub">
            링크 URL (선택)
          </label>
          <input
            id="linkUrl"
            name="linkUrl"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com"
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-text-sub dark:text-text-sub">
            파일 업로드 (선택)
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-sm text-text-sub dark:text-text-base file:mr-4 file:rounded-full file:border-0 file:bg-surface-strong dark:file:bg-surface-strong file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-text-sub dark:file:text-text-base hover:file:bg-surface-muted dark:hover:file:bg-surface-muted"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_20px_rgba(129,216,208,0.6)] transition hover:-translate-y-0.5 hover:bg-[#96e1da]"
          >
            게시하기
          </button>
          <Link
            href="/posts"
            className="rounded-full border border-border-base dark:border-border-base bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-medium text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
