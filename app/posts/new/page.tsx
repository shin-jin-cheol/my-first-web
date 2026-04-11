import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addPost } from "@/lib/posts";
import { addGuestPost } from "@/lib/guest-posts";
import { getMemberProfile, requireSession } from "@/lib/auth";

async function createPost(formData: FormData) {
  "use server";

  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const rawAuthor = String(formData.get("author") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const attachmentFile = formData.get("attachment");

  let author = rawAuthor;
  if (session.role === "member") {
    const profile = await getMemberProfile(session.userId);
    author = profile?.name?.trim() || session.userId;
  }

  if (!title || !author || !content) {
    return;
  }

  await addPost({
    title,
    author,
    authorId: session.role === "member" ? session.userId : undefined,
    content,
    linkUrl,
    attachmentFile: attachmentFile instanceof File ? attachmentFile : null,
  });

  if (session.role === "member") {
    await addGuestPost({
      title,
      content,
      authorId: session.userId,
    });
  }

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/guest");
  redirect("/posts");
}

export default async function NewPostPage() {
  const session = await requireSession();
  const profile = session.role === "member" ? await getMemberProfile(session.userId) : null;
  const defaultAuthor = session.role === "member" ? (profile?.name?.trim() || session.userId) : "";

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Write
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-100 drop-shadow-[0_0_12px_rgba(129,216,208,0.35)]">
          새 글 쓰기
        </h1>
      </header>

      <form
        action={createPost}
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
            placeholder="제목을 입력하세요"
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
            placeholder="작성자 이름"
            defaultValue={defaultAuthor}
            readOnly={session.role === "member"}
            className={`w-full rounded-xl border px-4 py-2.5 text-zinc-100 outline-none transition ${session.role === "member" ? "cursor-not-allowed border-zinc-700 bg-zinc-900/60 text-zinc-300" : "border-zinc-600 bg-zinc-900 focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)]"}`}
          />
          {session.role === "member" ? (
            <p className="text-xs text-zinc-400">회원가입 시 입력한 이름이 자동으로 사용됩니다.</p>
          ) : null}
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
            placeholder="글 내용을 입력하세요"
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
            placeholder="https://example.com"
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="attachment" className="text-sm font-medium text-zinc-200">
            파일 업로드 (선택)
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-zinc-600"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.6)] transition hover:-translate-y-0.5 hover:bg-[#96e1da] hover:shadow-[0_0_28px_rgba(129,216,208,0.75)]"
          >
            게시하기
          </button>
          <Link
            href="/posts"
            className="rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
