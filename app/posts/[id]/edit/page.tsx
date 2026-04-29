import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { BLOG_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { getPostById, updatePostById } from "@/lib/posts";
import { canManagePost } from "@/lib/permissions";
import { normalizeCategory, normalizeAttachment } from "@/lib/utils";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    redirect("/posts");
  }

  const post = await getPostById(postId);
  if (!post) {
    redirect("/posts");
  }

  const canEdit = canManagePost(session, post);
  if (!canEdit) {
    redirect(`/posts/${postId}`);
  }

  async function updatePostAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const currentPost = await getPostById(postId);
    const canUpdate = canManagePost(currentSession, currentPost ?? { authorId: undefined });

    if (!canUpdate) {
      redirect(`/posts/${postId}`);
    }

    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const category = String(formData.get("category") ?? "study").trim();
    const linkUrl = String(formData.get("linkUrl") ?? "").trim();
    const attachmentFile = formData.get("attachment");
    const removeAttachment = formData.get("removeAttachment") === "on";

    if (!title || !author || !content) {
      return;
    }

    if (currentSession.role !== "owner" && category === "notice") {
      redirect(`/posts/${postId}`);
    }

    await updatePostById(postId, {
      title,
      author,
      content,
      category: normalizeCategory(category, 'blog'),
      linkUrl,
      attachmentFile: normalizeAttachment(attachmentFile),
      removeAttachment,
    });

    revalidatePath("/", "page");
    revalidatePath("/posts", "page");
    revalidatePath(`/posts/${postId}`, "page");
    redirect(`/posts/${postId}?updated=${Date.now()}`);
  }

  const categoryOptions =
    session.role === "owner"
      ? BLOG_POST_CATEGORIES
      : BLOG_POST_CATEGORIES.filter((category) => category !== "notice");

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Edit</p>
        <h1 className="text-4xl font-extrabold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_12px_rgba(129,216,208,0.35)]">
          블로그 글 수정
        </h1>
      </header>

      <form
        action={updatePostAction}
        className="space-y-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-6 shadow-[0_0_28px_rgba(129,216,208,0.16)]"
      >
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            defaultValue={post.category}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post.title}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            작성자
          </label>
          <input
            id="author"
            name="author"
            type="text"
            required
            defaultValue={post.author}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={post.content}
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-3 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkUrl" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            링크 URL (선택)
          </label>
          <input
            id="linkUrl"
            name="linkUrl"
            type="text"
            inputMode="url"
            autoComplete="url"
            defaultValue={post.linkUrl ?? ""}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            파일 교체 (선택)
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-100 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-300 dark:file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-700 dark:file:text-zinc-100 hover:file:bg-zinc-400 dark:hover:file:bg-zinc-600"
          />
          {post.fileName ? (
            <label className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-300">
              <input type="checkbox" name="removeAttachment" className="h-4 w-4 accent-[#81d8d0]" />
              기존 첨부파일 제거
            </label>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.6)] transition hover:-translate-y-0.5 hover:bg-[#96e1da]"
          >
            저장하기
          </button>
          <Link
            href={`/posts/${post.id}`}
            className="rounded-full border border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-100 transition hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
