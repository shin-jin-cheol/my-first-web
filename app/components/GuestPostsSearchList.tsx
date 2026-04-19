"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  editHref?: string;
  postId?: number;
};

type Labels = {
  searchPlaceholder: string;
  empty: string;
  author: string;
  edit: string;
  delete: string;
};

type GuestPostsSearchListProps = {
  posts: GuestPostItem[];
  labels: Labels;
  sessionRole: "owner" | "member";
  sessionUserId: string;
  deleteAction: (formData: FormData) => void;
};

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export default function GuestPostsSearchList({
  posts,
  labels,
  sessionRole,
  sessionUserId,
  deleteAction,
}: GuestPostsSearchListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();

  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) =>
      [post.title, post.content, post.authorDisplay, post.date].some((field) => includesQuery(field, normalizedQuery)),
    );
  }, [posts, normalizedQuery]);

  return (
    <div className="space-y-4">
      <SearchBar value={query} onChange={setQuery} placeholder={labels.searchPlaceholder} />

      {filteredPosts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{labels.empty}</p>
      ) : (
        filteredPosts.map((post) => (
          <article key={String(post.id)} className="space-y-3 rounded-2xl border border-zinc-500 bg-zinc-300 p-5 transition hover:bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              <Link href={post.detailHref} className="transition hover:text-cyan-200">
                {post.title}
              </Link>
            </h2>
            <p className="text-zinc-700 dark:text-zinc-200">{post.content}</p>
            <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
              <p>{labels.author}: {post.authorDisplay}</p>
              <p>{post.date}</p>
            </div>

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

