"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SearchBar from "./SearchBar";

type BlogPostItem = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

type GuestPostItem = {
  id: string;
  title: string;
  content: string;
  authorDisplay: string;
  date: string;
  detailHref: string;
};

type PostsSearchContentProps = {
  blogPosts: BlogPostItem[];
  guestPosts: GuestPostItem[];
  labels: {
    searchPlaceholder: string;
    blogEmpty: string;
    guestSectionTitle: string;
    guestEmpty: string;
    author: string;
    date: string;
  };
};

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export default function PostsSearchContent({ blogPosts, guestPosts, labels }: PostsSearchContentProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();

  const filteredBlogPosts = useMemo(() => {
    if (!normalizedQuery) {
      return blogPosts;
    }

    return blogPosts.filter((post) =>
      [post.title, post.content, post.author, post.date].some((field) => includesQuery(field, normalizedQuery)),
    );
  }, [blogPosts, normalizedQuery]);

  const filteredGuestPosts = useMemo(() => {
    if (!normalizedQuery) {
      return guestPosts;
    }

    return guestPosts.filter((post) =>
      [post.title, post.content, post.authorDisplay, post.date].some((field) => includesQuery(field, normalizedQuery)),
    );
  }, [guestPosts, normalizedQuery]);

  return (
    <div className="space-y-8">
      <SearchBar value={query} onChange={setQuery} placeholder={labels.searchPlaceholder} />

      {filteredBlogPosts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{labels.blogEmpty}</p>
      ) : (
        <div className="grid gap-7 md:grid-cols-2">
          {filteredBlogPosts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <article className="block h-full min-h-64 cursor-pointer rounded-2xl border border-zinc-500 bg-zinc-300 p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-[#81d8d0] hover:bg-zinc-400 hover:shadow-[0_0_34px_rgba(129,216,208,0.28)] dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">{post.title}</h2>
                <p className="mb-5 line-clamp-4 text-base leading-7 text-zinc-700 dark:text-zinc-200">{post.content}</p>
                <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <p>
                    <strong>{labels.author}:</strong> {post.author}
                  </p>
                  <p>
                    <strong>{labels.date}:</strong> {post.date}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_10px_rgba(129,216,208,0.3)]">
          {labels.guestSectionTitle}
        </h2>
        {filteredGuestPosts.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{labels.guestEmpty}</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
            {filteredGuestPosts.map((post) => (
              <article key={post.id} className="h-full min-h-56 rounded-2xl border border-zinc-500 bg-zinc-300 p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-cyan-500/50 hover:bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  <Link href={post.detailHref} className="transition hover:text-cyan-200">
                    {post.title}
                  </Link>
                </h3>
                <p className="mb-5 line-clamp-4 text-base leading-7 text-zinc-700 dark:text-zinc-200">{post.content}</p>
                <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <p>
                    <strong>{labels.author}:</strong> {post.authorDisplay}
                  </p>
                  <p>
                    <strong>{labels.date}:</strong> {post.date}
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

