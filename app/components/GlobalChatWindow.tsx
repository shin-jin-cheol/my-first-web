"use client";

import Link from "next/link";
import { Expand, Loader2, Maximize2, MessageCircle, Minus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getChatWindowDataAction,
  type ChatWindowData,
} from "@/app/chat/[roomId]/actions";
import { ChatPanel } from "@/app/components/ChatPanel";
import { UserAvatar } from "@/app/components/UserAvatar";
import { useChat } from "@/lib/context/ChatContext";
import { usePlayer } from "@/lib/context/PlayerContext";

export function GlobalChatWindow() {
  const { state, setMode, closeChat } = useChat();
  const { isMinimized: isPlayerMinimized } = usePlayer();
  const [data, setData] = useState<(ChatWindowData & { roomId: string }) | null>(null);
  const [error, setError] = useState<{ roomId: string; message: string } | null>(null);
  const chatOffsetClass = isPlayerMinimized
    ? "bottom-[13.5rem] md:bottom-[5.5rem]"
    : "bottom-[17.5rem] md:bottom-[17.5rem]";
  const floatingChatFrameClass =
    "top-[4.75rem] h-auto min-h-0 p-1 md:top-auto md:h-[min(60vh,620px)] md:min-h-[480px]";

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
        className={`fixed ${chatOffsetClass} left-1/2 z-50 flex w-[min(calc(100vw-2rem),20rem)] -translate-x-1/2 items-center gap-2 rounded-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-[14px] py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-[0_2px_8px_rgb(0_0_0_/_0.08)] transition hover:brightness-95 dark:hover:brightness-110 md:left-auto md:right-4 md:w-80 md:translate-x-0`}
        aria-label={`${otherUser.name} 채팅 열기`}
      >
        <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={28} />
        <span className="min-w-0 flex-1 truncate text-left">{otherUser.name}</span>
        <MessageCircle aria-hidden="true" size={16} className="shrink-0" />
        <Maximize2 aria-hidden="true" size={16} className="shrink-0" />
      </button>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setMode("minimized")}
        aria-label="채팅창 최소화"
        title="Minimize"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-secondary)]"
      >
        <Minus aria-hidden="true" size={17} />
      </button>
      <Link
        href={`/chat/${encodeURIComponent(state.roomId)}`}
        onClick={() => setMode("fullscreen")}
        aria-label="채팅창 전체화면"
        title="Fullscreen"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-secondary)]"
      >
        <Expand aria-hidden="true" size={17} />
      </Link>
      <button
        type="button"
        onClick={closeChat}
        aria-label="채팅창 닫기"
        title="Close"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-secondary)]"
      >
        <X aria-hidden="true" size={17} />
      </button>
    </div>
  );

  return (
    <aside className={`fixed ${chatOffsetClass} ${floatingChatFrameClass} left-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 md:left-auto md:right-4 md:w-80 md:translate-x-0`}>
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
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] text-[var(--color-text-primary)] shadow-[0_4px_16px_rgb(0_0_0_/_0.1)]">
          <header className="flex items-center justify-between gap-3 border-b-[0.5px] border-[var(--color-border-tertiary)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={36} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-[var(--color-text-primary)]">{otherUser.name}</h2>
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
