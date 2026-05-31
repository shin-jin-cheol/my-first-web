"use client";

import Link from "next/link";
import { Expand, Loader2, Maximize2, MessageCircle, Minus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
  const { isMinimized: isPlayerMinimized, setMinimized: setPlayerMinimized } = usePlayer();
  const [data, setData] = useState<(ChatWindowData & { roomId: string }) | null>(null);
  const [error, setError] = useState<{ roomId: string; message: string } | null>(null);
  const chatOffsetClass = isPlayerMinimized ? "md:bottom-[6.75rem]" : "md:bottom-[18rem]";
  const floatingChatFrameClass = cn(
    "top-[4.75rem] h-auto min-h-0 p-1 md:top-auto md:h-[min(60vh,620px)] md:min-h-[480px]",
    isPlayerMinimized ? "bottom-[6rem]" : "bottom-[18rem]",
  );

  const shouldRenderChat = Boolean(
    state.roomId && (state.mode === "floating" || state.mode === "minimized"),
  );
  const showMobileDock = state.mode !== "fullscreen";
  const hasChatTab = Boolean(state.roomId && (state.mode === "floating" || state.mode === "minimized"));
  const isChatActive = state.mode === "floating";
  const isMusicActive = !isPlayerMinimized;
  const showMusicDockTab = isPlayerMinimized;
  const mobileDockBottomClass = isPlayerMinimized ? "bottom-[3.25rem]" : "bottom-[18rem]";

  useEffect(() => {
    let isCurrent = true;

    if (!shouldRenderChat || !state.roomId || data?.roomId === state.roomId) {
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
  }, [data?.roomId, shouldRenderChat, state.roomId]);

  const otherUser = useMemo(
    () => ({
      id: "",
      name: state.partnerName || "채팅",
      avatarUrl: state.partnerAvatarUrl,
    }),
    [state.partnerAvatarUrl, state.partnerName],
  );

  const activeData = state.roomId && data?.roomId === state.roomId ? data : null;
  const activeError = state.roomId && error?.roomId === state.roomId ? error.message : "";
  const roomIdForLink = state.roomId ?? "";

  function handleChatTabClick() {
    if (!hasChatTab) {
      return;
    }

    setMode(state.mode === "floating" ? "minimized" : "floating");
  }

  function handleMusicTabClick() {
    setPlayerMinimized(!isPlayerMinimized);
  }

  const baseDockPillClassName =
    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition";

  const chatDockClassName = cn(
    baseDockPillClassName,
    "max-w-[46vw]",
    isChatActive
      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]"
      : "border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] text-[var(--color-text-primary)]",
  );

  const musicDockClassName = cn(
    baseDockPillClassName,
    "max-w-[46vw]",
    isMusicActive
      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]"
      : "border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] text-[var(--color-text-primary)]",
  );

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
        href={`/chat/${encodeURIComponent(roomIdForLink)}`}
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
    <>
      {state.mode === "floating" && state.roomId ? (
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
      ) : null}

      {state.mode === "minimized" && state.roomId ? (
        <button
          type="button"
          onClick={() => setMode("floating")}
          className={`fixed ${chatOffsetClass} right-4 z-50 hidden w-80 items-center gap-2 rounded-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-[14px] py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-[0_2px_8px_rgb(0_0_0_/_0.08)] transition hover:brightness-95 dark:hover:brightness-110 md:flex`}
          aria-label={`${otherUser.name} 채팅 열기`}
        >
          <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={28} />
          <span className="min-w-0 flex-1 truncate text-left">{otherUser.name}</span>
          <MessageCircle aria-hidden="true" size={16} className="shrink-0" />
          <Maximize2 aria-hidden="true" size={16} className="shrink-0" />
        </button>
      ) : null}

      {showMobileDock && (hasChatTab || showMusicDockTab) ? (
        <div className={`fixed inset-x-0 ${mobileDockBottomClass} z-[55] flex justify-center px-3 md:hidden`}>
          {hasChatTab ? (
            <div className={cn("flex w-full max-w-sm items-center gap-2", showMusicDockTab ? "justify-between" : "justify-center")}>
              <button type="button" onClick={handleChatTabClick} className={chatDockClassName} aria-label="채팅 상태 전환">
                <MessageCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{isChatActive ? "채팅 중" : "채팅"}</span>
              </button>
              <button type="button" onClick={handleMusicTabClick} className={cn(musicDockClassName, !showMusicDockTab && "hidden")} aria-label="뮤직 상태 전환">
                <Maximize2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{isMusicActive ? "재생 중" : "뮤직"}</span>
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleMusicTabClick} className={`${musicDockClassName} max-w-[80vw]`} aria-label="뮤직 상태 전환">
              <Maximize2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{isMusicActive ? "재생 중" : "뮤직"}</span>
            </button>
          )}
        </div>
      ) : null}
    </>
  );
}
