"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  getNotificationSnapshotAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/components/notification-actions";
import { UserAvatar } from "@/app/components/UserAvatar";
import type { Notification } from "@/lib/notifications";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type NotificationBellProps = {
  userId: string;
  initialNotifications: Notification[];
  initialUnreadCount: number;
};

function isNotification(value: unknown): value is Notification {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeNotification = value as Partial<Notification>;
  return Boolean(
    maybeNotification.id &&
      maybeNotification.user_id &&
      typeof maybeNotification.type === "string" &&
      typeof maybeNotification.title === "string" &&
      typeof maybeNotification.body === "string" &&
      typeof maybeNotification.is_read === "boolean" &&
      maybeNotification.created_at,
  );
}

function getNotificationTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatRelativeTime(value: string) {
  const time = getNotificationTime(value);
  if (!time) {
    return "";
  }

  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(time));
}

function getAvatarName(notification: Notification) {
  const senderName = notification.body.split("님이")[0]?.trim();
  return senderName || notification.title;
}

function sortNotifications(notifications: Notification[]) {
  return [...notifications].sort(
    (first, second) =>
      getNotificationTime(second.created_at) - getNotificationTime(first.created_at),
  );
}

export function NotificationBell({
  userId,
  initialNotifications,
  initialUnreadCount,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => sortNotifications(initialNotifications));
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const badgeLabel = useMemo(() => {
    if (unreadCount > 99) {
      return "99+";
    }

    return String(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const channel = supabaseBrowserClient.channel(`notifications:${userId}`);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (!isNotification(payload.new)) {
          return;
        }
        const nextNotification = payload.new;

        setNotifications((currentNotifications) => {
          if (currentNotifications.some((notification) => notification.id === nextNotification.id)) {
            return currentNotifications;
          }

          return sortNotifications([nextNotification, ...currentNotifications]).slice(0, 20);
        });

        if (!nextNotification.is_read) {
          setUnreadCount((currentCount) => currentCount + 1);
        }
      },
    );

    channel.subscribe();

    return () => {
      supabaseBrowserClient.removeChannel(channel);
    };
  }, [userId]);

  function refreshSnapshot() {
    startTransition(async () => {
      const snapshot = await getNotificationSnapshotAction();
      setNotifications(sortNotifications(snapshot.notifications));
      setUnreadCount(snapshot.unreadCount);
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      const succeeded = await markAllNotificationsReadAction();
      if (!succeeded) {
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({ ...notification, is_read: true })),
      );
      setUnreadCount(0);
    });
  }

  async function handleNotificationClick(notification: Notification) {
    setIsOpen(false);

    if (notification.is_read) {
      if (notification.link) {
        router.push(notification.link);
      }
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((currentNotification) =>
        currentNotification.id === notification.id
          ? { ...currentNotification, is_read: true }
          : currentNotification,
      ),
    );
    setUnreadCount((currentCount) => Math.max(0, currentCount - 1));

    const succeeded = await markNotificationReadAction(notification.id);
    if (!succeeded) {
      refreshSnapshot();
    }

    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <div ref={containerRef} className="relative inline-flex h-9 shrink-0 items-center">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="알림"
        aria-expanded={isOpen}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:hover:bg-surface-strong"
      >
        <Bell aria-hidden="true" size={18} strokeWidth={2.2} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-[var(--text-base)] shadow-[0_2px_8px_rgb(from_var(--color-accent)_r_g_b_/_0.4)]">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <section className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border-base bg-surface-muted/95 text-text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_14px_30px_rgba(0,0,0,0.16)] backdrop-blur dark:border-border-base dark:bg-surface-sub/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_30px_rgba(0,0,0,0.38)]">
          <header className="flex items-center justify-between gap-3 border-b border-border-base px-4 py-3 dark:border-border-sub">
            <h2 className="text-sm font-bold text-text-base">알림</h2>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isPending || unreadCount === 0}
              className="text-xs font-semibold text-[var(--color-accent)] transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:brightness-110"
            >
              모두 읽음
            </button>
          </header>

          {notifications.length > 0 ? (
            <ol className="max-h-96 overflow-y-auto p-2">
              {notifications.map((notification) => {
                const content = (
                  <div
                    className={`flex gap-3 rounded-xl px-3 py-3 transition hover:bg-surface-sub dark:hover:bg-surface-strong ${
                      notification.is_read ? "" : "bg-[var(--color-accent-subtle)]"
                    }`}
                  >
                    <UserAvatar name={getAvatarName(notification)} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        {!notification.is_read ? (
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-text-base">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-text-sub">
                            {notification.body}
                          </p>
                          <p className="mt-1 text-[0.7rem] font-medium text-text-muted dark:text-text-subtle">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => {
                        void handleNotificationClick(notification);
                      }}
                      className="block w-full text-left"
                    >
                      {content}
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-text-muted dark:text-text-subtle">
              알림이 없습니다
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
