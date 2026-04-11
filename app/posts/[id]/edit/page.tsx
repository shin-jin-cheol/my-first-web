import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPostById, updatePostById } from "@/lib/posts";
import { requireSession } from "@/lib/auth";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await requireSession();

  const { id } = await params;
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    redirect("/posts");
  }

  const post = await getPostById(postId);

  if (!post) {
    redirect("/posts");
  }

  const canEdit = session.role === "owner" || (session.role === "member" && post.authorId === session.userId);
  if (!canEdit) {
    redirect(`/posts/${postId}`);
  }

  async function updatePostAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const currentPost = await getPostById(postId);
    const canUpdate =
      currentSession.role === "owner" ||
      (currentSession.role === "member" && currentPost?.authorId === currentSession.userId);

    if (!canUpdate) {
      redirect(`/posts/${postId}`);
    }

    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const linkUrl = String(formData.get("linkUrl") ?? "").trim();
    const attachmentFile = formData.get("attachment");
    const removeAttachment = formData.get("removeAttachment") === "on";

    if (!title || !author || !content) {
      return;
    }

    await updatePostById(postId, {
      title,
      author,
      content,
      linkUrl,
      attachmentFile: attachmentFile instanceof File ? attachmentFile : null,
      removeAttachment,
    });

    revalidatePath("/", "page");
    revalidatePath("/posts", "page");
    revalidatePath(`/posts/${postId}`, "page");
    redirect(`/posts/${postId}?updated=${Date.now()}`);
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Edit
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-100 drop-shadow-[0_0_12px_rgba(129,216,208,0.35)]">
          게시글 수정
        </h1>
        <p className="text-zinc-300">기존 내용을 수정하고 저장할 수 있어요.</p>
      </header>

      <form
        action={updatePostAction}
        className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-800 p-6 shadow-[0_0_28px_rgba(129,216,208,0.16)]"
      >
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-200">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post.title}
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="text-sm font-medium text-zinc-200">
            작성자
          </label>
          <input
            id="author"
            name="author"
            type="text"
            required
            defaultValue={post.author}
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-zinc-200">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={post.content}
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkUrl" className="text-sm font-medium text-zinc-200">
            링크 URL (선택)
          </label>
          <input
            id="linkUrl"
            name="linkUrl"
            type="url"
            defaultValue={post.linkUrl ?? ""}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-zinc-200">
            파일 교체 (선택)
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-zinc-600"
          />
          {post.fileName ? (
            <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="removeAttachment" className="h-4 w-4 accent-[#81d8d0]" />
              기존 첨부파일 제거
            </label>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.6)] transition hover:-translate-y-0.5 hover:bg-[#96e1da] hover:shadow-[0_0_28px_rgba(129,216,208,0.75)]"
          >
            저장하기
          </button>
          <Link
            href={`/posts/${post.id}`}
            className="rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
