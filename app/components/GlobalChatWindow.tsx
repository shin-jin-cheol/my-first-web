"use client";

import Link from "next/link";
import { Expand, Loader2, Maximize2, Minus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getChatWindowDataAction,
  type ChatWindowData,
} from "@/app/chat/[roomId]/actions";
import { ChatPanel } from "@/app/components/ChatPanel";
import { UserAvatar } from "@/app/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/context/ChatContext";

export function GlobalChatWindow() {
  const { state, setMode, closeChat } = useChat();
  const [data, setData] = useState<(ChatWindowData & { roomId: string }) | null>(null);
  const [error, setError] = useState<{ roomId: string; message: string } | null>(null);

  const shouldRender = Boolean(
    state.roomId && (state.mode === "floating" || state.mode === "minimized"),
  );

  useEffect(() => {
    let isCurrent = true;

    if (!shouldRender || !state.roomId || data?.roomId === state.roomId) {
      return;
    }

    const roomId = state.roomId;

    getChatWindowDataAction(roomId)
      .then((nextData) => {
        if (!isCurrent) {
          return;
        }

        if (!nextData) {
          setError({ roomId, message: "채팅방을 불러올 수 없습니다." });
          return;
        }

        setData({ ...nextData, roomId });
        setError(null);
      })
      .catch(() => {
        if (isCurrent) {
          setError({ roomId, message: "채팅방을 불러올 수 없습니다." });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [data?.roomId, shouldRender, state.roomId]);

  const otherUser = useMemo(
    () => ({
      id: "",
      name: state.partnerName || "채팅",
      avatarUrl: state.partnerAvatarUrl,
    }),
    [state.partnerAvatarUrl, state.partnerName],
  );

  if (!shouldRender || !state.roomId) {
    return null;
  }

  const activeData = data?.roomId === state.roomId ? data : null;
  const activeError = error?.roomId === state.roomId ? error.message : "";

  if (state.mode === "minimized") {
    return (
      <button
        type="button"
        onClick={() => setMode("floating")}
        className="fixed bottom-32 right-4 z-50 hidden max-w-72 items-center gap-3 rounded-full border border-border-base bg-surface-muted/95 px-4 py-3 text-sm font-semibold text-text-sub shadow-[0_10px_24px_rgb(from_var(--foreground)_r_g_b_/_0.14)] backdrop-blur transition hover:bg-surface-sub hover:text-text-base dark:border-border-sub dark:bg-surface-sub/90 dark:shadow-[0_10px_24px_rgb(from_var(--foreground)_r_g_b_/_0.08)] md:flex"
        aria-label={`${otherUser.name} 채팅 열기`}
      >
        <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={28} />
        <span className="truncate">{otherUser.name}</span>
        <Maximize2 aria-hidden="true" size={16} className="shrink-0" />
      </button>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setMode("minimized")}
        aria-label="채팅창 최소화"
        title="Minimize"
        className="rounded-full"
      >
        <Minus aria-hidden="true" size={17} />
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        aria-label="채팅창 전체화면"
        title="Fullscreen"
        className="rounded-full"
      >
        <Link
          href={`/chat/${encodeURIComponent(state.roomId)}`}
          onClick={() => setMode("fullscreen")}
        >
          <Expand aria-hidden="true" size={17} />
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={closeChat}
        aria-label="채팅창 닫기"
        title="Close"
        className="rounded-full"
      >
        <X aria-hidden="true" size={17} />
      </Button>
    </div>
  );

  return (
    <aside className="fixed bottom-32 right-4 z-50 hidden h-[min(75vh,620px)] min-h-[480px] w-80 md:block">
      {activeData ? (
        <ChatPanel
          roomId={state.roomId}
          initialMessages={activeData.initialMessages}
          currentUserId={activeData.currentUserId}
          otherUser={otherUser}
          chatImagesBucket={activeData.chatImagesBucket}
          headerActions={headerActions}
          showBackLink={false}
        />
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-base bg-surface-sub shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] dark:border-border-base dark:bg-surface-strong">
          <header className="flex items-center justify-between gap-3 border-b border-border-base px-4 py-3 dark:border-border-sub">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={36} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-text-base">{otherUser.name}</h2>
                <p className="truncate text-xs text-text-muted dark:text-text-subtle">loading</p>
              </div>
            </div>
            {headerActions}
          </header>
          <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-text-muted dark:text-text-subtle">
            {!activeError ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                채팅방을 불러오는 중입니다.
              </span>
            ) : (
              activeError
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
