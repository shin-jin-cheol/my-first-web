import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteGuestPostById, getGuestPosts } from "@/lib/guest-posts";
import { getMemberSummaries, requireSession } from "@/lib/auth";
import { getCategoryLabel, GUEST_POST_CATEGORIES } from "@/lib/post-categories";
import { getLocale, t } from "@/lib/i18n";
import GuestPostsSearchList from "@/app/components/GuestPostsSearchList";

type GuestBoardPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function GuestBoardPage({ searchParams }: GuestBoardPageProps) {
  const locale = await getLocale();
  const session = await requireSession();
  const guestBoardPosts = await getGuestPosts();
  const members = await getMemberSummaries();
  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";
  const memberNameById = new Map(members.map((member) => [member.id, member.name.trim()]));

  const posts = guestBoardPosts.map((post) => ({
    id: `guest-${post.id}`,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    authorDisplay: post.authorName || memberNameById.get(post.authorId) || post.authorId,
    date: post.date,
    detailHref: `/guest/${post.id}`,
    canManage: session.role === "owner" || (session.role === "member" && post.authorId === session.userId),
    editHref: `/guest/${post.id}/edit`,
    postId: post.id,
    category: post.category,
    categoryLabel: getCategoryLabel(post.category),
  }));

  async function deleteGuestPostAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    const postId = Number(formData.get("postId") ?? 0);
    if (!postId) {
      return;
    }

    const currentPosts = await getGuestPosts();
    const targetPost = currentPosts.find((post) => post.id === postId);
    const canDelete =
      currentSession.role === "owner" ||
      (currentSession.role === "member" && targetPost?.authorId === currentSession.userId);

    if (!canDelete) {
      return;
    }

    await deleteGuestPostById(postId);
    revalidatePath("/guest", "page");
    revalidatePath("/posts", "page");
    redirect(`/guest?deleted=${Date.now()}`);
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Guest Board
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_12px_rgba(129,216,208,0.3)]">
          {t(locale, "게스트 게시판", "Guest Board")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-300">
          {t(
            locale,
            "게스트 게시판에 쓴 글은 블로그 탭에도 연동되지만, 오너 글과는 분리되어 보입니다.",
            "Posts written here also appear in the blog tab, but remain separate from owner posts.",
          )}
        </p>
        {session.role === "member" ? (
          <div>
            <Link
              href="/guest/new"
              className="inline-flex rounded-full border border-[#74cfc6] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_18px_rgba(129,216,208,0.5)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              {t(locale, "게스트 글 쓰기", "Write Guest Post")}
            </Link>
          </div>
        ) : null}
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {session.role === "owner" ? (
        <p className="rounded-xl border border-cyan-600/40 bg-cyan-500/10 px-4 py-3 text-sm text-[#2f8f88] shadow-[0_0_12px_rgba(129,216,208,0.24)] dark:text-cyan-200 dark:shadow-none">
          {t(
            locale,
            "주인 계정으로 로그인 중입니다. 회원이 작성한 게스트 게시글을 관리할 수 있습니다.",
            "You are logged in as owner and can manage guest posts.",
          )}
        </p>
      ) : null}

      <GuestPostsSearchList
        posts={posts}
        categoryOptions={[
          { value: "all", label: t(locale, "전체", "All") },
          ...GUEST_POST_CATEGORIES.map((category) => ({
            value: category,
            label: getCategoryLabel(category),
          })),
        ]}
        labels={{
          searchPlaceholder: t(locale, "제목, 내용, 작성자 검색", "Search title, content, author"),
          empty: t(locale, "검색 결과가 없습니다.", "No matching posts found."),
          author: t(locale, "작성자", "Author"),
          date: t(locale, "날짜", "Date"),
          category: t(locale, "카테고리", "Category"),
          edit: t(locale, "수정하기", "Edit"),
          delete: t(locale, "삭제하기", "Delete"),
        }}
        deleteAction={deleteGuestPostAction}
      />
    </section>
  );
}
