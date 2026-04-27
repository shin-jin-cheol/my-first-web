import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { BLOG_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { addPost } from "@/lib/posts";

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.includes("NEXT_REDIRECT")
  );
}

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
      category:
        category === "notice"
          ? "notice"
          : category === "daily"
            ? "daily"
            : category === "info"
              ? "info"
              : "study",
      linkUrl,
      attachmentFile: attachmentFile instanceof File ? attachmentFile : null,
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
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Write
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_12px_rgba(129,216,208,0.35)]">
          블로그 글 쓰기
        </h1>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <form
        action={createPost}
        className="space-y-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-6 shadow-[0_0_28px_rgba(129,216,208,0.16)]"
      >
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            defaultValue="study"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          >
            {BLOG_POST_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="제목을 입력해 주세요."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
            작성자
          </label>
          <input
            id="author"
            name="author"
            type="text"
            required
            placeholder="작성자 이름"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            placeholder="글 내용을 입력해 주세요."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkUrl" className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
            링크 URL (선택)
          </label>
          <input
            id="linkUrl"
            name="linkUrl"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
            파일 업로드 (선택)
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-100 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-200 dark:file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-700 dark:file:text-zinc-100 hover:file:bg-zinc-300 dark:hover:file:bg-zinc-600"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.6)] transition hover:-translate-y-0.5 hover:bg-[#96e1da]"
          >
            게시하기
          </button>
          <Link
            href="/posts"
            className="rounded-full border border-zinc-300 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-100 transition hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
