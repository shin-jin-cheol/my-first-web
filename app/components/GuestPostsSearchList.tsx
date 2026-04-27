"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GuestPostCategory } from "@/lib/post-categories";
import SearchBar from "./SearchBar";

type GuestPostItem = {
  id: number | string;
  title: string;
  content: string;
  authorId: string;
  authorDisplay: string;
  date: string;
  detailHref: string;
  canManage: boolean;
  category: GuestPostCategory;
  categoryLabel: string;
  editHref?: string;
  postId?: number;
};

type CategoryOption = {
  value: "all" | GuestPostCategory;
  label: string;
};

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
  categoryOptions: CategoryOption[];
  labels: Labels;
  deleteAction: (formData: FormData) => void;
};

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export default function GuestPostsSearchList({
  posts,
  categoryOptions,
  labels,
  deleteAction,
}: GuestPostsSearchListProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | GuestPostCategory>("all");
  const normalizedQuery = query.trim();

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" ? true : post.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        [post.title, post.content, post.authorDisplay, post.date].some((field) =>
          includesQuery(field, normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });
  }, [posts, normalizedQuery, selectedCategory]);

  return (
    <div className="space-y-4">
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

      {filteredPosts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{labels.empty}</p>
      ) : (
        filteredPosts.map((post) => (
          <article
            key={String(post.id)}
            className="space-y-3 rounded-2xl border border-zinc-500 bg-zinc-300 p-5 transition hover:bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-[#2f8f88] dark:text-cyan-200">
                {post.categoryLabel}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              <Link href={post.detailHref} className="transition hover:text-cyan-200">
                {post.title}
              </Link>
            </h2>
            <p className="text-zinc-700 dark:text-zinc-200">{post.content}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p>
                {labels.author}: {post.authorDisplay}
              </p>
              <p>{labels.date}: {post.date}</p>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {labels.category}: {post.categoryLabel}
            </p>

            {post.canManage ? (
              <div className="flex items-center gap-2">
                {post.editHref ? (
                  <Link
                    href={post.editHref}
                    className="rounded-full border border-zinc-600 bg-zinc-400 px-4 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-500 dark:border-cyan-500/50 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                  >
                    {labels.edit}
                  </Link>
                ) : null}
                {typeof post.postId === "number" ? (
                  <form action={deleteAction}>
                    <input type="hidden" name="postId" value={post.postId} />
                    <button
                      type="submit"
                      className="rounded-full border border-zinc-600 bg-zinc-400 px-4 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-500 dark:border-red-400/60 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
                    >
                      {labels.delete}
                    </button>
                  </form>
                ) : null}
              </div>
            ) : null}
          </article>
        ))
      )}
    </div>
  );
}
