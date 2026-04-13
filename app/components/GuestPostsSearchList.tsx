"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SearchBar from "./SearchBar";

type GuestPostItem = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorDisplay: string;
  date: string;
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
        <p className="text-zinc-400">{labels.empty}</p>
      ) : (
        filteredPosts.map((post) => {
          const canManage = sessionRole === "owner" || (sessionRole === "member" && post.authorId === sessionUserId);

          return (
            <article key={post.id} className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-800 p-5">
              <h2 className="text-xl font-bold text-zinc-100">
                <Link href={`/guest/${post.id}`} className="transition hover:text-cyan-200">
                  {post.title}
                </Link>
              </h2>
              <p className="text-zinc-300">{post.content}</p>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <p>{labels.author}: {post.authorDisplay}</p>
                <p>{post.date}</p>
              </div>

              {canManage ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/guest/${post.id}/edit`}
                    className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20"
                  >
                    {labels.edit}
                  </Link>
                  <form action={deleteAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-400/60 bg-red-500/20 px-4 py-1.5 text-sm font-semibold text-red-300 hover:bg-red-500/30"
                    >
                      {labels.delete}
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          );
        })
      )}
    </div>
  );
}
