"use client";

import Link from "next/link";
import SearchableList from "./SearchableList";
import type { GuestPostCategory } from "@/lib/post-categories";
import type { GuestPostItem, CategoryOption } from "@/types/posts";

type Labels = {
  searchPlaceholder: string;
  empty: string;
  author: string;
  date: string;
  category: string;
  edit: string;
  delete: string;
};

type GuestPostsSearchListProps = {
  posts: GuestPostItem[];
  categoryOptions: CategoryOption<import("@/lib/post-categories").GuestPostCategory>[];
  labels: Labels;
  deleteAction: (formData: FormData) => void;
};

export default function GuestPostsSearchList({
  posts,
  categoryOptions,
  labels,
  deleteAction,
}: GuestPostsSearchListProps) {
  return (
    <SearchableList
      rootClassName="space-y-4"
      searchPlaceholder={labels.searchPlaceholder}
      categoryOptions={categoryOptions}
      sections={[
        {
          key: "guest-posts",
          items: posts,
          emptyLabel: labels.empty,
          categoryMatches: (post: GuestPostItem, currentCategory: "all" | GuestPostCategory) =>
            currentCategory === "all" ? true : post.category === currentCategory,
          queryFields: (post: GuestPostItem) => [post.title, post.content, post.authorDisplay, post.date],
          renderItem: (post: GuestPostItem) => (
            <article
              key={String(post.id)}
              className="space-y-3 rounded-2xl border border-border-strong bg-surface-muted p-5 transition hover:bg-surface-strong dark:border-border-sub dark:bg-surface-sub dark:hover:bg-surface-strong"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-[var(--accent-dark)] dark:text-accent-sub">
                  {post.categoryLabel}
                </span>
              </div>
              <h2 className="text-xl font-bold text-text-base dark:text-text-base">
                <Link href={post.detailHref} className="transition hover:text-accent-sub">
                  {post.title}
                </Link>
              </h2>
              <p className="text-text-sub dark:text-text-sub">{post.content}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-sub dark:text-text-muted">
                <p>
                  {labels.author}: {post.authorDisplay}
                </p>
                <p>{labels.date}: {post.date}</p>
              </div>
              <p className="text-sm text-text-sub dark:text-text-muted">
                {labels.category}: {post.categoryLabel}
              </p>

              {post.canManage ? (
                <div className="flex items-center gap-2">
                  {post.editHref ? (
                    <Link
                      href={post.editHref}
                      className="rounded-full border border-border-sub bg-surface-muted px-4 py-1.5 text-sm font-semibold text-text-base hover:bg-surface-strong dark:border-accent-border dark:bg-accent-soft dark:text-accent-sub dark:hover:bg-accent-soft"
                    >
                      {labels.edit}
                    </Link>
                  ) : null}
                  {typeof post.postId === "number" ? (
                    <form action={deleteAction}>
                      <input type="hidden" name="postId" value={post.postId} />
                      <button
                        type="submit"
                        className="rounded-full border border-border-sub bg-surface-muted px-4 py-1.5 text-sm font-semibold text-text-base hover:bg-surface-strong dark:border-danger-border dark:bg-danger-soft dark:text-danger-sub dark:hover:bg-danger-soft"
                      >
                        {labels.delete}
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </article>
          ),
        },
      ]}
    />
  );
}
