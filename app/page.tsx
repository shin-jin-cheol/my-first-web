import Link from "next/link";
import { posts } from "@/lib/posts";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-rose-500">
          Blog Posts
        </p>
        <h1 className="text-4xl font-extrabold text-slate-800">게시글 목록</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <article className="block h-full cursor-pointer rounded-2xl border border-orange-200 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <h2 className="mb-2 text-lg font-bold text-slate-800">{post.title}</h2>
              <p className="mb-4 line-clamp-3 text-sm text-slate-600">{post.content}</p>
              <div className="space-y-1 text-xs text-slate-500">
                <p>
                  <strong>작성자:</strong> {post.author}
                </p>
                <p>
                  <strong>날짜:</strong> {post.date}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
