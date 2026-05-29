import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import SearchableList, { createSearchableListSection } from "./SearchableList";
import { UserAvatar } from "@/app/components/UserAvatar";
import type { BlogPostCategory } from "@/lib/post-categories";
import type { OwnerPostItem, CommunityPostItem, CategoryOption } from "@/types/posts";

type PostsSearchContentProps = {
  ownerPosts: OwnerPostItem[];
  communityPosts: CommunityPostItem[];
  categoryOptions: CategoryOption<import("@/lib/post-categories").BlogPostCategory>[];
  labels: {
    searchPlaceholder: string;
    ownerSectionTitle: string;
    ownerEmpty: string;
    communitySectionTitle: string;
    communityEmpty: string;
    author: string;
    date: string;
    category: string;
    views: string;
  };
};

export default function PostsSearchContent({
  ownerPosts,
  communityPosts,
  categoryOptions,
  labels,
}: PostsSearchContentProps) {
  return (
    <SearchableList
      rootClassName="space-y-8"
      searchPlaceholder={labels.searchPlaceholder}
      categoryOptions={categoryOptions}
      sections={[
        createSearchableListSection({
          key: "owner-posts",
          items: ownerPosts,
          emptyLabel: labels.ownerEmpty,
          sectionClassName: "space-y-4",
          heading: (
            <h2 className="text-2xl font-bold text-text-sub dark:text-text-base drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)]">
              {labels.ownerSectionTitle}
            </h2>
          ),
          listClassName: "grid gap-7 md:grid-cols-2",
          categoryMatches: (post: OwnerPostItem, currentCategory: "all" | BlogPostCategory) =>
            currentCategory === "all" ? true : post.category === currentCategory,
          queryFields: (post: OwnerPostItem) => [post.title, post.content, post.author, post.date],
          renderItem: (post: OwnerPostItem) => {
            const authorHref = `/profile/${encodeURIComponent(post.authorId)}`;

            return (
              <ScrollReveal key={post.id} className="h-full">
                <article className="h-full min-h-64 rounded-2xl border border-border-strong bg-surface-muted p-7 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] transition hover:border-[var(--accent-primary)] hover:bg-surface-strong hover:shadow-[0_0_16px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] dark:border-border-sub dark:bg-surface-sub dark:hover:bg-surface-strong">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
                      {labels.ownerSectionTitle}
                    </p>
                    <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-[var(--accent-dark)] dark:text-accent-sub">
                      {post.categoryLabel}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-text-base dark:text-text-base">
                    <Link href={post.detailHref} className="transition hover:text-accent-sub">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mb-5 line-clamp-4 text-base leading-7 text-text-sub dark:text-text-sub">
                    {post.content}
                  </p>
                  <div className="space-y-2 text-sm text-text-sub dark:text-text-muted">
                    <p className="flex flex-wrap items-center gap-2">
                      <strong>{labels.author}:</strong>{" "}
                      <UserAvatar name={post.author} avatarUrl={post.avatarUrl} size={28} />
                      <Link href={authorHref} className="font-semibold transition hover:text-accent-sub">
                        {post.author}
                      </Link>
                    </p>
                    <p>
                      <strong>{labels.date}:</strong> {post.date}
                    </p>
                    <p>
                      <strong>{labels.category}:</strong> {post.categoryLabel}
                    </p>
                    <p>
                      <strong>{labels.views}:</strong> {post.views}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            );
          },
        }),
        createSearchableListSection({
          key: "community-posts",
          items: communityPosts,
          emptyLabel: labels.communityEmpty,
          sectionClassName: "space-y-4 pt-4",
          heading: (
            <h2 className="text-2xl font-bold text-text-sub dark:text-text-base drop-shadow-[0_0_6px_rgba(129,216,208,0.08)]">
              {labels.communitySectionTitle}
            </h2>
          ),
          listClassName: "grid gap-7 md:grid-cols-2",
          categoryMatches: (post: CommunityPostItem, currentCategory: "all" | BlogPostCategory) =>
            currentCategory === "all"
              ? true
              : currentCategory === "notice"
                ? false
                : post.category === currentCategory,
          queryFields: (post: CommunityPostItem) => [
            post.title,
            post.content,
            post.authorDisplay,
            post.date,
            post.sourceLabel,
          ],
          renderItem: (post: CommunityPostItem) => {
            const authorHref = `/profile/${encodeURIComponent(post.authorId)}`;

            return (
              <ScrollReveal key={post.id} className="h-full">
                <article className="h-full min-h-56 rounded-2xl border border-border-strong bg-surface-muted p-7 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] transition hover:border-accent-border hover:bg-surface-strong dark:border-border-sub dark:bg-surface-sub dark:hover:bg-surface-strong">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border-base bg-surface-strong px-2.5 py-1 text-xs font-semibold text-text-sub dark:border-border-sub dark:bg-surface-strong dark:text-text-sub">
                      {post.sourceLabel}
                    </span>
                    <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-[var(--accent-dark)] dark:text-accent-sub">
                      {post.categoryLabel}
                    </span>
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-text-base dark:text-text-base">
                    <Link href={post.detailHref} className="transition hover:text-accent-sub">
                      {post.title}
                    </Link>
                  </h4>
                  <p className="mb-5 line-clamp-4 text-base leading-7 text-text-sub dark:text-text-sub">
                    {post.content}
                  </p>
                  <div className="space-y-2 text-sm text-text-sub dark:text-text-muted">
                    <p className="flex flex-wrap items-center gap-2">
                      <strong>{labels.author}:</strong>{" "}
                      <UserAvatar name={post.authorDisplay} avatarUrl={post.avatarUrl} size={28} />
                      <Link href={authorHref} className="font-semibold transition hover:text-accent-sub">
                        {post.authorDisplay}
                      </Link>
                    </p>
                    <p>
                      <strong>{labels.date}:</strong> {post.date}
                    </p>
                    <p>
                      <strong>{labels.category}:</strong> {post.categoryLabel}
                    </p>
                    <p>
                      <strong>{labels.views}:</strong> {post.views}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            );
          },
        }),
      ]}
    />
  );
}
