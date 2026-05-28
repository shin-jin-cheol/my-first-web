import Link from "next/link";
import {
  acceptFriendRequestAction,
  deleteFriendAction,
  rejectFriendRequestAction,
  sendFriendRequestAction,
} from "@/app/friends/actions";
import { FriendChatButton } from "@/app/friends/FriendChatButton";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { getMemberById, getMemberByName, ownerAccount } from "@/lib/auth/core";
import { getAvatarColorClass, getAvatarText } from "@/lib/avatar-utils";
import { type Friend, getFriends, getPendingRequests } from "@/lib/friends";

type FriendsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

type SearchResultItem = {
  id: string;
  name: string;
};

type FriendUserItem = {
  friend: Friend;
  userId: string;
  name: string;
  avatarText: string;
  avatarColor: string;
};

async function getDisplayName(userId: string) {
  if (userId === ownerAccount.id) {
    return ownerAccount.name;
  }

  const member = await getMemberById(userId);
  return member?.name || userId;
}

async function toFriendUserItem(friend: Friend, userId: string): Promise<FriendUserItem> {
  const name = await getDisplayName(userId);

  return {
    friend,
    userId,
    name,
    avatarText: getAvatarText(name),
    avatarColor: getAvatarColorClass(name),
  };
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

async function submitSendFriendRequestAction(formData: FormData) {
  "use server";
  await sendFriendRequestAction(formData);
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const session = await requireSession();
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || "";
  const searchResultItems: SearchResultItem[] = [];

  if (query) {
    if (ownerAccount.name.includes(query)) {
      searchResultItems.push({ id: ownerAccount.id, name: ownerAccount.name });
    }

    const member = await getMemberByName(query);
    if (member) {
      searchResultItems.push({ id: member.id, name: member.name });
    }
  }

  const [pendingRequests, friends] = await Promise.all([
    getPendingRequests(session.userId),
    getFriends(session.userId),
  ]);
  const pendingRequestItems = await Promise.all(
    pendingRequests.map((friend) => toFriendUserItem(friend, friend.requesterId)),
  );
  const friendItems = await Promise.all(
    friends.map((friend) => {
      const friendUserId =
        friend.requesterId === session.userId ? friend.receiverId : friend.requesterId;
      return toFriendUserItem(friend, friendUserId);
    }),
  );

  return (
    <section className="space-y-8">
      <header className="space-y-2 rounded-2xl border border-border-base bg-surface-sub p-6 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] dark:border-border-base dark:bg-surface-strong">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
          Friends
        </p>
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">
          친구
        </h1>
      </header>

      <section className="space-y-4">
        <form
          action="/friends"
          className="flex flex-col gap-3 rounded-2xl border border-border-base bg-surface-sub p-4 dark:border-border-base dark:bg-surface-strong sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="사용자 이름 검색"
            className="min-h-9 flex-1 rounded-lg border border-border-base bg-surface px-3 py-2 text-sm text-text-base outline-none transition placeholder:text-text-muted focus:border-accent-border dark:border-border-sub dark:bg-surface-muted dark:text-text-base dark:placeholder:text-text-subtle"
          />
          <Button type="submit" className="sm:w-auto">
            검색
          </Button>
        </form>

        {query ? (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-text-sub dark:text-text-base">
              검색 결과
            </h2>
            {searchResultItems.length > 0 ? (
              searchResultItems.map((searchResult) => (
              <article
                key={searchResult.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border-strong bg-surface-muted p-5 transition hover:bg-surface-strong dark:border-border-sub dark:bg-surface-sub dark:hover:bg-surface-strong"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-[var(--surface)]"
                    style={{ backgroundColor: getAvatarColorClass(searchResult.name) }}
                  >
                    {getAvatarText(searchResult.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-text-base">
                      {searchResult.name}
                    </p>
                    <p className="truncate text-sm text-text-muted dark:text-text-subtle">
                      @{searchResult.id}
                    </p>
                  </div>
                </div>
                {searchResult.id !== session.userId ? (
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/profile/${encodeURIComponent(searchResult.id)}`}>
                        프로필 보기
                      </Link>
                    </Button>
                    <form action={submitSendFriendRequestAction}>
                      <input type="hidden" name="receiverId" value={searchResult.id} />
                      <Button type="submit" size="sm">
                        친구 요청
                      </Button>
                    </form>
                  </div>
                ) : null}
              </article>
              ))
            ) : (
              <p className="rounded-2xl border border-border-base bg-surface-sub px-4 py-3 text-sm text-text-muted dark:bg-surface-strong">
                검색 결과가 없습니다.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text-sub dark:text-text-base">
          받은 친구 요청
        </h2>
        {pendingRequestItems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {pendingRequestItems.map((item) => (
              <article
                key={item.friend.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border-strong bg-surface-muted p-5 transition hover:bg-surface-strong dark:border-border-sub dark:bg-surface-sub dark:hover:bg-surface-strong"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-[var(--surface)]"
                    style={{ backgroundColor: item.avatarColor }}
                  >
                    {item.avatarText}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${encodeURIComponent(item.userId)}`}
                      className="block truncate text-base font-bold text-text-base transition hover:text-accent-sub"
                    >
                      {item.name}
                    </Link>
                    <p className="truncate text-sm text-text-muted dark:text-text-subtle">
                      @{item.userId}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <form action={submitAcceptFriendRequestAction}>
                    <input type="hidden" name="friendId" value={item.friend.id} />
                    <Button type="submit" size="sm">
                      수락
                    </Button>
                  </form>
                  <form action={submitRejectFriendRequestAction}>
                    <input type="hidden" name="friendId" value={item.friend.id} />
                    <Button type="submit" variant="outline" size="sm">
                      거절
                    </Button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border-base bg-surface-sub px-4 py-3 text-sm text-text-muted dark:bg-surface-strong">
            받은 친구 요청이 없습니다.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text-sub dark:text-text-base">
          친구 목록
        </h2>
        {friendItems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {friendItems.map((item) => (
              <article
                key={item.friend.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border-strong bg-surface-muted p-5 transition hover:bg-surface-strong dark:border-border-sub dark:bg-surface-sub dark:hover:bg-surface-strong"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-[var(--surface)]"
                    style={{ backgroundColor: item.avatarColor }}
                  >
                    {item.avatarText}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${encodeURIComponent(item.userId)}`}
                      className="block truncate text-base font-bold text-text-base transition hover:text-accent-sub"
                    >
                      {item.name}
                    </Link>
                    <p className="truncate text-sm text-text-muted dark:text-text-subtle">
                      @{item.userId}
                    </p>
                  </div>
                </div>
                <FriendChatButton friendId={item.userId} />
                <form action={submitDeleteFriendAction} className="shrink-0">
                  <input type="hidden" name="friendId" value={item.friend.id} />
                  <Button type="submit" variant="outline" size="sm">
                    친구 삭제
                  </Button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border-base bg-surface-sub px-4 py-3 text-sm text-text-muted dark:bg-surface-strong">
            아직 친구가 없습니다.
          </p>
        )}
      </section>
    </section>
  );
}
