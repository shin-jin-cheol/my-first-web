"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BlogPostCategory } from "@/lib/post-categories";
import SearchBar from "./SearchBar";

type OwnerPostItem = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: BlogPostCategory;
  categoryLabel: string;
  detailHref: string;
};

type CommunityPostItem = {
  id: string;
  title: string;
  content: string;
  authorDisplay: string;
  date: string;
  detailHref: string;
  category: BlogPostCategory;
  categoryLabel: string;
  sourceLabel: string;
};

type CategoryOption = {
  value: "all" | BlogPostCategory;
  label: string;
};

type PostsSearchContentProps = {
  ownerPosts: OwnerPostItem[];
  communityPosts: CommunityPostItem[];
  categoryOptions: CategoryOption[];
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

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

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
                  ? "border-[#74cfc6] bg-[#81d8d0] text-zinc-900 shadow-[0_0_18px_rgba(129,216,208,0.4)]"
                  : "border-zinc-400 bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_10px_rgba(129,216,208,0.3)]">
          {labels.ownerSectionTitle}
        </h2>
        {filteredOwnerPosts.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{labels.ownerEmpty}</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
            {filteredOwnerPosts.map((post) => (
              <Link key={post.id} href={post.detailHref}>
                <article className="block h-full min-h-64 cursor-pointer rounded-2xl border border-zinc-500 bg-zinc-300 p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-[#81d8d0] hover:bg-zinc-400 hover:shadow-[0_0_34px_rgba(129,216,208,0.28)] dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {labels.ownerSectionTitle}
                    </p>
                    <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-[#2f8f88] dark:text-cyan-200">
                      {post.categoryLabel}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {post.title}
                  </h3>
                  <p className="mb-5 line-clamp-4 text-base leading-7 text-zinc-700 dark:text-zinc-200">
                    {post.content}
                  </p>
                  <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
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
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_10px_rgba(129,216,208,0.3)]">
          {labels.communitySectionTitle}
        </h2>
        {filteredCommunityPosts.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{labels.communityEmpty}</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
            {filteredCommunityPosts.map((post) => (
              <article
                key={post.id}
                className="h-full min-h-56 rounded-2xl border border-zinc-500 bg-zinc-300 p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-cyan-500/50 hover:bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-zinc-400 bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                    {post.sourceLabel}
                  </span>
                  <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-[#2f8f88] dark:text-cyan-200">
                    {post.categoryLabel}
                  </span>
                </div>
                <h4 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  <Link href={post.detailHref} className="transition hover:text-cyan-200">
                    {post.title}
                  </Link>
                </h4>
                <p className="mb-5 line-clamp-4 text-base leading-7 text-zinc-700 dark:text-zinc-200">
                  {post.content}
                </p>
                <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
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
