import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { safeDecodeURIComponent } from "@/lib/safe-decode";
import { BLOG_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { getLocale, tk } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPost } from "@/app/posts/actions";

type NewPostPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  const [locale, session] = await Promise.all([getLocale(), requireSession()]);
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
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)]">
          {tk(locale, "writeBlogPost")}
        </h1>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-sub">
          {errorMessage}
        </p>
      ) : null}

      <form
        action={createPost}
        className="space-y-5 rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-6 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)]"
      >
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {tk(locale, "category")}
          </label>
          <select
            id="category"
            name="category"
            defaultValue="study"
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)] dark:[color-scheme:dark] dark:[&>option]:bg-surface-sub dark:[&>option]:text-text-base"
          >
            {BLOG_POST_CATEGORIES.map((category) => (
              <option key={category} value={category} style={{ color: "black", background: "white" }}>
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
            placeholder={tk(locale, "enterTitle")}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
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
            placeholder={tk(locale, "enterAuthorName")}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
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
            placeholder={tk(locale, "enterContent")}
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-3 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
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
            placeholder="https://example.com"
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none transition focus:border-[var(--accent-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-text-sub dark:text-text-sub">
            {tk(locale, "uploadFileOptional")}
          </label>
          <Input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-sm text-text-sub dark:text-text-base file:mr-4 file:rounded-full file:border-0 file:bg-surface-strong dark:file:bg-surface-sub file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-text-sub dark:file:text-text-base hover:file:bg-surface-muted dark:hover:file:bg-surface-muted"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            className="rounded-full border border-[var(--accent-light)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-light-sub)]"
          >
            {tk(locale, "publish")}
          </Button>
          <Link
            href="/posts"
            className="rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-medium text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong"
          >
            {tk(locale, "cancel")}
          </Link>
        </div>
      </form>
    </section>
  );
}
