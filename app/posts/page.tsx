import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { getLocale, t } from "@/lib/i18n";
import { getGuestPosts } from "@/lib/guest-posts";
import { getMemberSummaries } from "@/lib/auth";
import PostsSearchContent from "@/app/components/PostsSearchContent";

export default async function PostsPage() {
  const locale = await getLocale();
  const posts = await getPosts();
  const guestPosts = await getGuestPosts();
  const members = await getMemberSummaries();
  const memberNameById = new Map(
    members
      .map((member) => [member.id, member.name.trim()] as const)
      .filter((entry) => Boolean(entry[1])),
  );

  const memberIdSet = new Set(members.map((member) => member.id));
  const memberNameSet = new Set(
    members.map((member) => member.name.trim()).filter((name) => Boolean(name)),
  );

  const memberPosts = posts.filter(
    (post) =>
      (post.authorId ? memberIdSet.has(post.authorId) : false) ||
      memberIdSet.has(post.author) ||
      memberNameSet.has(post.author),
  );

  const blogPosts = posts.filter((post) => !memberPosts.some((memberPost) => memberPost.id === post.id));

  const guestPostSignatures = new Set(
    guestPosts.map((post) => `${post.title}|${post.content}|${post.authorId}|${post.date}`),
  );

  const migratedMemberPosts = memberPosts
    .map((post) => ({
      id: `migrated-${post.id}`,
      title: post.title,
      content: post.content,
      authorId: post.authorId ?? post.author,
      authorName: post.author,
      date: post.date,
      linkUrl: post.linkUrl,
      fileUrl: post.fileUrl,
      fileName: post.fileName,
      detailHref: `/posts/${post.id}`,
    }))
    .filter((post) => !guestPostSignatures.has(`${post.title}|${post.content}|${post.authorId}|${post.date}`));

  const allGuestPosts = [
    ...migratedMemberPosts,
    ...guestPosts.map((post) => ({
      ...post,
      id: `guest-${post.id}`,
      detailHref: `/guest/${post.id}`,
    })),
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Blog Posts
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-100 drop-shadow-[0_0_14px_rgba(129,216,208,0.45)]">
          {t(locale, "게시글 목록", "Post List")}
        </h1>
      </div>

      <PostsSearchContent
        blogPosts={blogPosts}
        guestPosts={allGuestPosts.map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          authorDisplay: post.authorName || memberNameById.get(post.authorId) || post.authorId,
          date: post.date,
          detailHref: post.detailHref,
        }))}
        labels={{
          searchPlaceholder: t(locale, "제목, 내용, 작성자 검색", "Search title, content, author"),
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
