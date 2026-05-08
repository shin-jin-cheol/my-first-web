import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { BLOG_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { getPostById } from "@/lib/posts";
import { canManagePost } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLocale, tk } from "@/lib/i18n";
import { updatePostAction } from "@/app/posts/actions";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const [locale, session, resolvedParams] = await Promise.all([
    getLocale(),
    requireSession(),
    params,
  ]);
  const { id } = resolvedParams;
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

  const boundUpdatePostAction = updatePostAction.bind(null, postId);

  const categoryOptions =
    session.role === "owner"
      ? BLOG_POST_CATEGORIES
      : BLOG_POST_CATEGORIES.filter((category) => category !== "notice");

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-subtle">Edit</p>
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)]">
          {tk(locale, "editBlogPost")}
        </h1>
      </header>

      <form
        action={boundUpdatePostAction}
        className="space-y-5 rounded-2xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-strong p-6 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)]"
      >
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {tk(locale, "category")}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={post.category}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)] dark:[color-scheme:dark] dark:[&>option]:bg-surface-sub dark:[&>option]:text-text-base"
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
            {tk(locale, "title")}
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post.title}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {tk(locale, "author")}
          </label>
          <Input
            id="author"
            name="author"
            type="text"
            required
            defaultValue={post.author}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {tk(locale, "content")}
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={post.content}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-3 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkUrl" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {tk(locale, "linkUrlOptional")}
          </label>
          <Input
            id="linkUrl"
            name="linkUrl"
            type="text"
            inputMode="url"
            autoComplete="url"
            defaultValue={post.linkUrl ?? ""}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {tk(locale, "replaceFileOptional")}
          </label>
          <Input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-sm text-text-sub dark:text-text-base file:mr-4 file:rounded-full file:border-0 file:bg-surface-muted dark:file:bg-surface-sub file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-text-sub dark:file:text-text-base hover:file:bg-surface-strong dark:hover:file:bg-surface-muted"
          />
          {post.fileName ? (
            <label className="inline-flex items-center gap-2 text-sm text-text-muted dark:text-text-muted">
              <Input type="checkbox" name="removeAttachment" className="h-4 w-4 accent-[var(--accent-primary)]" />
              {tk(locale, "removeExistingAttachment")}
            </label>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            className="rounded-full border border-[var(--accent-light)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-light-sub)]"
          >
            {tk(locale, "save")}
          </Button>
          <Link
            href={`/posts/${post.id}`}
            className="rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-medium text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
          >
            {tk(locale, "cancel")}
          </Link>
        </div>
      </form>
    </section>
  );
}
