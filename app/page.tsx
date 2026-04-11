import Link from "next/link";
import { getPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Blog Posts
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-100 drop-shadow-[0_0_14px_rgba(129,216,208,0.45)]">
          게시글 목록
        </h1>
      </div>
      <div className="grid gap-7 grid-cols-1 max-w-2xl">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <article className="block h-full min-h-64 cursor-pointer rounded-2xl border border-zinc-700 bg-zinc-800 p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-[#81d8d0] hover:bg-zinc-700 hover:shadow-[0_0_34px_rgba(129,216,208,0.28)]">
              <h2 className="mb-3 text-xl font-bold text-zinc-100">{post.title}</h2>
              <p className="mb-5 line-clamp-4 text-base leading-7 text-zinc-300">{post.content}</p>
              <div className="space-y-2 text-sm text-zinc-400">
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
