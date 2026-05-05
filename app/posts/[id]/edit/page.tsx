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
        <p className="text-sm font-semibold uppercase tracking-wider text-text-subtle">Edit</p>
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base drop-shadow-[0_0_6px_rgba(129,216,208,0.08)]">
          블로그 글 수정
        </h1>
      </header>

      <form
        action={updatePostAction}
        className="space-y-5 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-6 shadow-[0_0_12px_rgba(129,216,208,0.05)]"
      >
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-text-sub dark:text-text-sub">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            defaultValue={post.category}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
          >
            {categoryOptions.map((category) => (
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
            required
            defaultValue={post.title}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
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
            defaultValue={post.author}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
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
            defaultValue={post.content}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-3 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
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
            defaultValue={post.linkUrl ?? ""}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[#81d8d0]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-text-sub dark:text-text-sub">
            파일 교체 (선택)
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-sm text-text-sub dark:text-text-base file:mr-4 file:rounded-full file:border-0 file:bg-surface-muted dark:file:bg-surface-sub file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-text-sub dark:file:text-text-base hover:file:bg-surface-strong dark:hover:file:bg-surface-muted"
          />
          {post.fileName ? (
            <label className="inline-flex items-center gap-2 text-sm text-text-muted dark:text-text-muted">
              <input type="checkbox" name="removeAttachment" className="h-4 w-4 accent-[#81d8d0]" />
              기존 첨부파일 제거
            </label>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_12px_rgba(129,216,208,0.18)] transition hover:-translate-y-0.5 hover:bg-[#96e1da]"
          >
            저장하기
          </button>
          <Link
            href={`/posts/${post.id}`}
            className="rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-medium text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
