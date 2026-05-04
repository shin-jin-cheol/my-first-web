"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import type { BlogPostCategory } from "@/lib/post-categories";
import { includesQuery } from "@/lib/search";
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
  };
};

export default function PostsSearchContent({
  ownerPosts,
  communityPosts,
  categoryOptions,
  labels,
}: PostsSearchContentProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | BlogPostCategory>("all");
  const normalizedQuery = query.trim();

  const filteredOwnerPosts = useMemo(() => {
    return ownerPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" ? true : post.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        [post.title, post.content, post.author, post.date].some((field) =>
          includesQuery(field, normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });
  }, [ownerPosts, normalizedQuery, selectedCategory]);

  const filteredCommunityPosts = useMemo(() => {
    return communityPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all"
          ? true
          : selectedCategory === "notice"
            ? false
            : post.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        [post.title, post.content, post.authorDisplay, post.date, post.sourceLabel].some((field) =>
          includesQuery(field, normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });
  }, [communityPosts, normalizedQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      <SearchBar value={query} onChange={setQuery} placeholder={labels.searchPlaceholder} />

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((option) => {
          const active = selectedCategory === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedCategory(option.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                active
                  ? "border-[#74cfc6] bg-[#81d8d0] text-text-base shadow-[0_0_18px_rgba(129,216,208,0.4)]"
                  : "border-border-base bg-surface-strong text-text-sub hover:bg-surface-muted dark:border-border-base dark:bg-surface-sub dark:text-text-sub dark:hover:bg-surface-strong"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-sub dark:text-text-base drop-shadow-[0_0_10px_rgba(129,216,208,0.3)]">
          {labels.ownerSectionTitle}
        </h2>
        {filteredOwnerPosts.length === 0 ? (
          <p className="text-text-muted dark:text-text-subtle">{labels.ownerEmpty}</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
            {filteredOwnerPosts.map((post) => (
              <Link key={post.id} href={post.detailHref}>
                <article className="block h-full min-h-64 cursor-pointer rounded-2xl border border-border-base bg-surface-muted p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-[#81d8d0] hover:bg-surface-strong hover:shadow-[0_0_34px_rgba(129,216,208,0.28)] dark:border-border-base dark:bg-surface-sub dark:hover:bg-surface-strong">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
                      {labels.ownerSectionTitle}
                    </p>
                    <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-[#2f8f88] dark:text-accent-sub">
                      {post.categoryLabel}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-text-base dark:text-text-base">
                    {post.title}
                  </h3>
                  <p className="mb-5 line-clamp-4 text-base leading-7 text-text-sub dark:text-text-sub">
                    {post.content}
                  </p>
                  <div className="space-y-2 text-sm text-text-sub dark:text-text-muted">
                    <p>
                      <strong>{labels.author}:</strong> {post.author}
                    </p>
                    <p>
                      <strong>{labels.date}:</strong> {post.date}
                    </p>
                    <p>
                      <strong>{labels.category}:</strong> {post.categoryLabel}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-text-sub dark:text-text-base drop-shadow-[0_0_10px_rgba(129,216,208,0.3)]">
          {labels.communitySectionTitle}
        </h2>
        {filteredCommunityPosts.length === 0 ? (
          <p className="text-text-muted dark:text-text-subtle">{labels.communityEmpty}</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
            {filteredCommunityPosts.map((post) => (
              <article
                key={post.id}
                className="h-full min-h-56 rounded-2xl border border-border-base bg-surface-muted p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-accent-border-sub hover:bg-surface-strong dark:border-border-base dark:bg-surface-sub dark:hover:bg-surface-strong"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border-base bg-surface-strong px-2.5 py-1 text-xs font-semibold text-text-sub dark:border-border-base dark:bg-surface-sub dark:text-text-sub">
                    {post.sourceLabel}
                  </span>
                  <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-[#2f8f88] dark:text-accent-sub">
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
                  <p>
                    <strong>{labels.author}:</strong> {post.authorDisplay}
                  </p>
                  <p>
                    <strong>{labels.date}:</strong> {post.date}
                  </p>
                  <p>
                    <strong>{labels.category}:</strong> {post.categoryLabel}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
