import Link from "next/link";
import { redirect } from "next/navigation";
import { getGuestPostById } from "@/lib/guest-posts";
import { requireSession } from "@/lib/auth";
import { getCategoryLabel, GUEST_POST_CATEGORIES } from "@/lib/post-categories";
import { getLocale, t, tk } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canManagePost } from "@/lib/permissions";
import { safeDecodeURIComponent } from "@/lib/safe-decode";
import { updateGuestPostAction } from "@/app/guest/actions";

type EditGuestPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditGuestPostPage({ params, searchParams }: EditGuestPostPageProps) {
  const [locale, session, resolvedParams, query] = await Promise.all([
    getLocale(),
    requireSession(),
    params,
    searchParams,
  ]);
  const { id } = resolvedParams;
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

  const boundUpdateGuestPostAction = updateGuestPostAction.bind(null, postId);

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
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-sub">
          {errorMessage}
        </p>
      ) : null}

      <form
        action={boundUpdateGuestPostAction}
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
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[var(--accent-primary)]"
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
          <Input
            id="title"
            name="title"
            type="text"
            defaultValue={post.title}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[var(--accent-primary)]"
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
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-3 text-text-sub dark:text-text-base outline-none focus:border-[var(--accent-primary)]"
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
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-strong dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[var(--accent-primary)] dark:[color-scheme:dark] dark:[&>option]:bg-surface-sub dark:[&>option]:text-text-base"
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
            className="rounded-full border border-[var(--accent-light)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base"
          >
            {t(locale, "저장하기", "Save")}
          </Button>
          <Link
            href="/guest"
            className="rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-medium text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
          >
            {t(locale, "취소", "Cancel")}
          </Link>
        </div>
      </form>
    </section>
  );
}
