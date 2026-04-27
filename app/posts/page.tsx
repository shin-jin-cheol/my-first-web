import { getGuestPosts } from "@/lib/guest-posts";
import { getMemberSummaries } from "@/lib/auth";
import { BLOG_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { getPosts } from "@/lib/posts";
import { getLocale, t } from "@/lib/i18n";
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

  const ownerPosts = posts.filter((post) => (post.authorId ? !memberIdSet.has(post.authorId) : true));
  const memberBlogPosts = posts.filter((post) => (post.authorId ? memberIdSet.has(post.authorId) : false));

  const ownerPostItems = ownerPosts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    date: post.date,
    category: post.category,
    categoryLabel: getCategoryLabel(post.category),
    detailHref: `/posts/${post.id}`,
  }));

  const memberBlogItems = memberBlogPosts.map((post) => {
    const category: "study" | "daily" | "info" =
      post.category === "daily" ? "daily" : post.category === "info" ? "info" : "study";

    return {
      id: `member-blog-${post.id}`,
      title: post.title,
      content: post.content,
      authorDisplay: memberNameById.get(post.authorId ?? "") || post.author,
      date: post.date,
      detailHref: `/posts/${post.id}`,
      category,
      categoryLabel: getCategoryLabel(category),
      sourceLabel: t(locale, "회원 블로그", "Member Blog"),
    };
  });

  const guestBoardItems = guestPosts.map((post) => {
    const category: "study" | "daily" | "info" =
      post.category === "daily" ? "daily" : post.category === "info" ? "info" : "study";

    return {
      id: `guest-board-${post.id}`,
      title: post.title,
      content: post.content,
      authorDisplay: post.authorName || memberNameById.get(post.authorId) || post.authorId,
      date: post.date,
      detailHref: `/guest/${post.id}`,
      category,
      categoryLabel: getCategoryLabel(category),
      sourceLabel: t(locale, "게스트 글", "Guest Post"),
    };
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Blog Posts
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-700 dark:text-zinc-100 drop-shadow-[0_0_14px_rgba(129,216,208,0.45)]">
          {t(locale, "블로그 게시글", "Blog Posts")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-300">
          {t(
            locale,
            "오너가 작성한 글과 게스트/회원 글을 분리해서 볼 수 있습니다.",
            "Owner posts and guest/member posts are shown in separate sections.",
          )}
        </p>
      </div>

      <PostsSearchContent
        ownerPosts={ownerPostItems}
        communityPosts={[...memberBlogItems, ...guestBoardItems]}
        categoryOptions={[
          { value: "all", label: t(locale, "전체", "All") },
          ...BLOG_POST_CATEGORIES.map((category) => ({
            value: category,
            label: getCategoryLabel(category),
          })),
        ]}
        labels={{
          searchPlaceholder: t(locale, "제목, 내용, 작성자 검색", "Search title, content, author"),
          ownerSectionTitle: t(locale, "오너 글", "Owner Posts"),
          ownerEmpty: t(locale, "해당 카테고리에 오너 글이 없습니다.", "No owner posts found in this category."),
          communitySectionTitle: t(locale, "게스트/회원 글", "Guest and Member Posts"),
          communityEmpty: t(
            locale,
            "해당 카테고리에 게스트/회원 글이 없습니다.",
            "No guest or member posts found in this category.",
          ),
          author: t(locale, "작성자", "Author"),
          date: t(locale, "날짜", "Date"),
          category: t(locale, "카테고리", "Category"),
        }}
      />
    </div>
  );
}
