import Link from "next/link";
import { notFound } from "next/navigation";
import {
  acceptFriendRequestAction,
  deleteFriendAction,
  rejectFriendRequestAction,
  sendFriendRequestAction,
} from "@/app/friends/actions";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getGuestPosts } from "@/lib/guest-posts";
import { getPosts } from "@/lib/posts";
import { getMemberById, ownerAccount } from "@/lib/auth/core";
import { formatKstDateString } from "@/lib/date";
import { getFriendStatus } from "@/lib/friends";
import { getLocale, t } from "@/lib/i18n";
import { getCategoryLabel } from "@/lib/post-categories";
import { UserAvatar } from "@/app/components/UserAvatar";
import { AvatarUpload } from "./AvatarUpload";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

type ProfilePostItem = {
  id: number;
  title: string;
  content: string;
  date: string;
  categoryLabel: string;
  href: string;
  views: number;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const [locale, resolvedParams] = await Promise.all([getLocale(), params]);
  const profileId = decodeURIComponent(resolvedParams.id).trim();

  if (!profileId) {
    notFound();
  }

  const isOwnerProfile = profileId === ownerAccount.id;
  const member = await getMemberById(profileId);

  if (!isOwnerProfile && !member) {
    notFound();
  }

  const profileName = isOwnerProfile ? ownerAccount.name : member?.name || profileId;
  const session = await getSession();
  const isOwnProfile = session?.userId === profileId;
  const friendStatus =
    session && session.userId !== profileId ? await getFriendStatus(session.userId, profileId) : undefined;
  const joinedDate = !isOwnerProfile && member?.createdAt
    ? formatKstDateString(member.createdAt)
    : t(locale, "운영자 계정", "Owner account");
  const avatarUrl = member?.avatarUrl;

  const authoredPosts: ProfilePostItem[] = isOwnerProfile
    ? (await getPosts())
        .filter((post) => (post.authorId ? post.authorId === ownerAccount.id : true))
        .map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          date: post.date,
          categoryLabel: getCategoryLabel(post.category),
          href: `/posts/${post.id}`,
          views: post.views,
        }))
    : (await getGuestPosts())
        .filter((post) => post.authorId === profileId)
        .map((post) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          date: post.date,
          categoryLabel: getCategoryLabel(post.category),
          href: `/guest/${post.id}`,
          views: post.views,
        }));

  async function submitSendFriendRequestAction(formData: FormData) {
    "use server";
    await sendFriendRequestAction(formData);
  }

  async function submitAcceptFriendRequestAction(formData: FormData) {
    "use server";
    await acceptFriendRequestAction(formData);
  }

  async function submitRejectFriendRequestAction(formData: FormData) {
    "use server";
    await rejectFriendRequestAction(formData);
  }

  async function submitDeleteFriendAction(formData: FormData) {
    "use server";
    await deleteFriendAction(formData);
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-border-base bg-surface-sub p-6 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] dark:border-border-base dark:bg-surface-strong sm:flex-row sm:items-center">
        <UserAvatar name={profileName} avatarUrl={avatarUrl} size={80} />
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
            {t(locale, "프로필", "Profile")}
          </p>
          <h1 className="truncate text-3xl font-extrabold text-text-sub dark:text-text-base">
            {profileName}
          </h1>
          <p className="text-sm text-text-muted dark:text-text-subtle">
            {t(locale, "가입일", "Joined")}: {joinedDate}
          </p>
          {isOwnProfile ? <AvatarUpload userId={profileId} /> : null}
          {session && session.userId !== profileId ? (
            <div className="flex flex-wrap gap-2">
              {friendStatus?.status === "accepted" ? (
                <form action={submitDeleteFriendAction}>
                  <input type="hidden" name="friendId" value={friendStatus.id} />
                  <Button type="submit" variant="outline" size="sm">
                    친구 삭제
                  </Button>
                </form>
              ) : friendStatus?.status === "pending" && friendStatus.requesterId === session.userId ? (
                <form action={submitDeleteFriendAction}>
                  <input type="hidden" name="friendId" value={friendStatus.id} />
                  <Button type="submit" variant="outline" size="sm">
                    요청 취소
                  </Button>
                </form>
              ) : friendStatus?.status === "pending" && friendStatus.receiverId === session.userId ? (
                <>
                  <form action={submitAcceptFriendRequestAction}>
                    <input type="hidden" name="friendId" value={friendStatus.id} />
                    <Button type="submit" size="sm">
                      수락
                    </Button>
                  </form>
                  <form action={submitRejectFriendRequestAction}>
                    <input type="hidden" name="friendId" value={friendStatus.id} />
                    <Button type="submit" variant="outline" size="sm">
                      거절
                    </Button>
                  </form>
                </>
              ) : (
                <form action={submitSendFriendRequestAction}>
                  <input type="hidden" name="receiverId" value={profileId} />
                  <Button type="submit" size="sm">
                    친구 요청
                  </Button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </header>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-sub dark:text-text-base">
          {isOwnerProfile
            ? t(locale, "작성한 블로그 게시글", "Blog Posts")
            : t(locale, "작성한 게스트 게시글", "Guest Posts")}
        </h2>

        {authoredPosts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {authoredPosts.map((post) => (
              <article
                key={`${post.href}-${post.id}`}
                className="space-y-3 rounded-2xl border border-border-strong bg-surface-muted p-5 transition hover:bg-surface-strong dark:border-border-sub dark:bg-surface-sub dark:hover:bg-surface-strong"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-xs font-semibold text-[var(--accent-dark)] dark:text-accent-sub">
                    {post.categoryLabel}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-base dark:text-text-base">
                  <Link href={post.href} className="transition hover:text-accent-sub">
                    {post.title}
                  </Link>
                </h3>
                <p className="line-clamp-3 text-text-sub dark:text-text-sub">{post.content}</p>
                <div className="flex flex-wrap gap-3 text-sm text-text-muted dark:text-text-subtle">
                  <span>{post.date}</span>
                  <span>
                    {t(locale, "조회수", "Views")}: {post.views}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border-base bg-surface-sub px-4 py-3 text-sm text-text-muted dark:bg-surface-strong">
            {isOwnerProfile
              ? t(locale, "작성한 블로그 게시글이 없습니다.", "No blog posts yet.")
              : t(locale, "작성한 게스트 게시글이 없습니다.", "No guest posts yet.")}
          </p>
        )}
      </div>
    </section>
  );
}
