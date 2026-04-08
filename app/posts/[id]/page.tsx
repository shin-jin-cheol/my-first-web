import Link from "next/link";
import { posts } from "@/lib/posts";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const post = posts.find((item) => item.id === postId);

  if (!post) {
    return (
      <div className="space-y-6 rounded-2xl border border-amber-200 bg-white/85 p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-800">게시글 상세</h1>
        <p className="text-slate-600">게시글을 찾을 수 없습니다</p>
        <Link
          href="/posts"
          className="inline-flex rounded-full bg-gradient-to-r from-amber-400 to-rose-400 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-6 rounded-2xl border border-amber-200 bg-white/85 p-8 shadow-sm">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-rose-500">Post Detail</p>
        <h1 className="text-3xl font-extrabold text-slate-800">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <p>
            <strong>작성자:</strong> {post.author}
          </p>
          <p>
            <strong>날짜:</strong> {post.date}
          </p>
        </div>
      </header>

      <p className="leading-7 text-slate-700">{post.content}</p>

      <Link
        href="/posts"
        className="inline-flex rounded-full bg-gradient-to-r from-amber-400 to-rose-400 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
      >
        목록으로 돌아가기
      </Link>
    </article>
  );
}
