import { Suspense } from "react";
import Link from "next/link";
import { getGuestPosts } from "@/lib/guest-posts";
import { ownerAccount } from "@/lib/auth";
import { readMembers } from "@/lib/auth/core";
import { BLOG_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { getPosts } from "@/lib/posts";
import { getLocale, t } from "@/lib/i18n";
import { getOwnerAvatarUrl } from "@/lib/owner-settings";
import PostsSearchContent from "@/app/components/PostsSearchContent";
import { Skeleton } from "@/app/components/Skeleton";
import { normalizePostSort, type PostSortKey } from "@/lib/post-sort";

type PostsPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  return (
    <Suspense fallback={<PostsPageSkeleton />}>
      <PostsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PostsPageContent({ searchParams }: PostsPageProps) {
  const [locale, posts, guestPosts, members, ownerAvatarUrl] = await Promise.all([
    getLocale(),
    searchParams.then((params) => getPosts(params.sort)),
    searchParams.then((params) => getGuestPosts(params.sort)),
    readMembers(),
    getOwnerAvatarUrl(),
  ]);
  const params = await searchParams;
  const sort = normalizePostSort(params.sort);
  const memberNameById = new Map(
    members
      .map((member) => [member.id, member.name.trim()] as const)
      .filter((entry) => Boolean(entry[1])),
  );
  const memberIdSet = new Set(members.map((member) => member.id));
  const memberAvatarById = new Map(members.map((member) => [member.id, member.avatarUrl ?? null]));

  if (ownerAvatarUrl) {
    memberAvatarById.set(ownerAccount.id, ownerAvatarUrl);
  }

  const ownerPosts = posts.filter((post) => (post.authorId ? !memberIdSet.has(post.authorId) : true));
  const memberBlogPosts = posts.filter((post) => (post.authorId ? memberIdSet.has(post.authorId) : false));

  const ownerPostItems = ownerPosts.map((post) => {
    const authorId = post.authorId ?? ownerAccount.id;

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId,
      author: post.author,
      avatarUrl: memberAvatarById.get(authorId) ?? null,
      date: post.date,
      category: post.category,
      categoryLabel: getCategoryLabel(post.category),
      detailHref: `/posts/${post.id}`,
      views: post.views,
    };
  });

  const memberBlogItems = memberBlogPosts.map((post) => {
    const category: "study" | "daily" | "info" =
      post.category === "daily" ? "daily" : post.category === "info" ? "info" : "study";

    return {
      id: `member-blog-${post.id}`,
      title: post.title,
      content: post.content,
      authorId: post.authorId ?? "",
      authorDisplay: memberNameById.get(post.authorId ?? "") || post.author,
      avatarUrl: memberAvatarById.get(post.authorId ?? "") ?? null,
      date: post.date,
      detailHref: `/posts/${post.id}`,
      category,
      categoryLabel: getCategoryLabel(category),
      sourceLabel: t(locale, "회원 블로그", "Member Blog"),
      views: post.views,
    };
  });

  const guestBoardItems = guestPosts.map((post) => {
    const category: "study" | "daily" | "info" =
      post.category === "daily" ? "daily" : post.category === "info" ? "info" : "study";

    return {
      id: `guest-board-${post.id}`,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorDisplay: post.authorName || memberNameById.get(post.authorId) || post.authorId,
      avatarUrl: memberAvatarById.get(post.authorId) ?? null,
      date: post.date,
      detailHref: `/guest/${post.id}`,
      category,
      categoryLabel: getCategoryLabel(category),
      sourceLabel: t(locale, "게스트 게시글", "Guest Post"),
      views: post.views,
    };
  });

  const sortOptions: Array<{ value: PostSortKey; label: string }> = [
    { value: "latest", label: t(locale, "최신", "Latest") },
    { value: "views", label: t(locale, "조회수", "Views") },
    { value: "likes", label: t(locale, "좋아요", "Likes") },
    { value: "comments", label: t(locale, "댓글순", "Comments") },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
          Blog Posts
        </p>
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base drop-shadow-[0_0_14px_rgba(129,216,208,0.45)]">
          {t(locale, "블로그 게시글", "Blog Posts")}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <Link
            key={option.value}
            href={`?sort=${option.value}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              sort === option.value
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-text-base"
                : "border-border-sub bg-surface text-text-sub hover:border-[var(--accent-primary)] hover:text-text-base dark:bg-surface-sub"
            }`}
          >
            {option.label}
          </Link>
        ))}
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
          ownerSectionTitle: t(locale, "게시글", "Posts"),
          ownerEmpty: t(locale, "해당 카테고리에 게시글이 없습니다.", "No posts found in this category."),
          communitySectionTitle: t(locale, "게스트 게시글", "Guest Posts"),
          communityEmpty: t(locale, "해당 카테고리에 게스트 게시글이 없습니다.", "No guest posts found in this category."),
          author: t(locale, "작성자", "Author"),
          date: t(locale, "날짜", "Date"),
          category: t(locale, "카테고리", "Category"),
          views: t(locale, "조회수", "Views"),
        }}
      />
    </div>
  );
}

function PostsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-56" />
      </div>

      <div className="space-y-4 rounded-2xl border border-border-base bg-surface p-4 dark:border-border-sub dark:bg-surface-sub">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border-base bg-surface p-4 dark:border-border-sub dark:bg-surface-sub">
        <Skeleton className="h-7 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
