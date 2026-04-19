import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { getLocale, t } from "@/lib/i18n";
import { getMemberSummaries } from "@/lib/auth";
import PostsSearchContent from "@/app/components/PostsSearchContent";

export default async function PostsPage() {
  const locale = await getLocale();
  const posts = await getPosts();
  const members = await getMemberSummaries();
  const memberNameById = new Map(
    members
      .map((member) => [member.id, member.name.trim()] as const)
      .filter((entry) => Boolean(entry[1])),
  );

  const memberIdSet = new Set(members.map((member) => member.id));

  const memberPosts = posts.filter(
    (post) => (post.authorId ? memberIdSet.has(post.authorId) : false),
  );

  const ownerPosts = posts.filter((post) => !memberPosts.some((memberPost) => memberPost.id === post.id));

  const blogOwnerPosts = ownerPosts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    date: post.date,
    detailHref: `/posts/${post.id}`,
  }));

  const memberGuestItems = memberPosts.map((post) => ({
    id: `member-${post.id}`,
    title: post.title,
    content: post.content,
    authorDisplay: memberNameById.get(post.authorId ?? "") || post.author,
    date: post.date,
    detailHref: `/posts/${post.id}`,
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Blog Posts
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_14px_rgba(129,216,208,0.45)]">
          {t(locale, "게시글 목록", "Post List")}
        </h1>
      </div>

      <PostsSearchContent
        ownerPosts={blogOwnerPosts}
        memberGuestPosts={memberGuestItems}
        labels={{
          searchPlaceholder: t(locale, "제목, 내용, 작성자 검색", "Search title, content, author"),
          ownerSectionTitle: t(locale, "게시글", "Posts"),
          blogEmpty: t(locale, "검색 결과가 없습니다.", "No matching posts found."),
          guestSectionTitle: t(locale, "게스트 게시글", "Guest Posts"),
          guestEmpty: t(locale, "검색 결과가 없습니다.", "No matching posts found."),
          author: t(locale, "작성자", "Author"),
          date: t(locale, "날짜", "Date"),
        }}
      />
    </div>
  );
}

