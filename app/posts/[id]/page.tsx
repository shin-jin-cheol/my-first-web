import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deletePostById, getPostById } from "@/lib/posts";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const post = await getPostById(postId);

  async function deletePostAction() {
    "use server";

    await deletePostById(postId);
    revalidatePath("/");
    revalidatePath("/posts");
    redirect("/posts");
  }

  if (!post) {
    return (
      <div className="space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-8 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
        <h1 className="text-3xl font-extrabold text-zinc-100">게시글 상세</h1>
        <p className="text-zinc-300">게시글을 찾을 수 없습니다</p>
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-600"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-8 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Post Detail</p>
        <h1 className="text-3xl font-extrabold text-zinc-100">{post.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <p>
            <strong>작성자:</strong> {post.author}
          </p>
          <p>
            <strong>날짜:</strong> {post.date}
          </p>
        </div>
      </header>

      <p className="leading-7 text-zinc-300">{post.content}</p>

      <div className="flex items-center gap-3">
        <Link
          href="/posts"
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-600"
        >
          목록으로 돌아가기
        </Link>
        <Link
          href={`/posts/${post.id}/edit`}
          className="inline-flex rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.5)] transition hover:-translate-y-0.5 hover:bg-[#96e1da]"
        >
          수정하기
        </Link>
        <form action={deletePostAction}>
          <button
            type="submit"
            className="inline-flex rounded-full border border-red-400/60 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30"
          >
            삭제하기
          </button>
        </form>
      </div>
    </article>
  );
}
