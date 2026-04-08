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
      <div className="grid gap-7 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <article className="block h-full min-h-64 cursor-pointer rounded-3xl border border-orange-200 bg-white/85 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <h2 className="mb-3 text-xl font-bold text-slate-800">{post.title}</h2>
              <p className="mb-5 line-clamp-4 text-base leading-7 text-slate-600">{post.content}</p>
              <div className="space-y-2 text-sm text-slate-500">
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
