"use client";

import { Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { sendChatMessageAction } from "@/app/chat/[roomId]/actions";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/chat";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type ChatWindowProps = {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
};

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeMessage = value as Partial<Message>;
  return Boolean(
    maybeMessage.id &&
      maybeMessage.room_id &&
      maybeMessage.sender_id &&
      typeof maybeMessage.content === "string" &&
      maybeMessage.created_at,
  );
}

export default function ChatWindow({
  roomId,
  initialMessages,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const trimmedContent = content.trim();
  const canSend = trimmedContent.length > 0 && !isPending;

  const messageCountLabel = useMemo(() => `${messages.length} messages`, [messages.length]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const addMessage = (message: Message) => {
      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
          return currentMessages;
        }

        return [...currentMessages, message].sort(
          (first, second) =>
            new Date(first.created_at).getTime() - new Date(second.created_at).getTime(),
        );
      });
    };

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (isMessage(payload.new)) {
            addMessage(payload.new);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedContent) {
      return;
    }

    const formData = new FormData();
    formData.set("roomId", roomId);
    formData.set("content", trimmedContent);

    setError("");
    setContent("");

    startTransition(async () => {
      const message = await sendChatMessageAction(formData);
      if (!message) {
        setError("메시지를 보낼 수 없습니다.");
        setContent(trimmedContent);
        return;
      }

      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-base bg-surface-sub shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] dark:border-border-base dark:bg-surface-strong">
      <header className="flex items-center justify-between gap-3 border-b border-border-base px-4 py-3 dark:border-border-sub">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-text-base">채팅</h1>
          <p className="truncate text-xs text-text-muted dark:text-text-subtle">
            {messageCountLabel}
          </p>
        </div>
        <p className="shrink-0 rounded-full border border-border-base px-3 py-1 text-xs text-text-muted dark:border-border-sub dark:text-text-subtle">
          Live
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {messages.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;

              return (
                <li
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[min(78%,36rem)] rounded-2xl border px-4 py-2 ${
                      isOwnMessage
                        ? "border-accent-border bg-accent-soft text-text-base"
                        : "border-border-base bg-surface text-text-base dark:border-border-sub dark:bg-surface-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>
                    <p className="mt-1 text-right text-[0.7rem] text-text-muted dark:text-text-subtle">
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center rounded-xl border border-dashed border-border-base bg-surface dark:border-border-sub dark:bg-surface-muted">
            <p className="text-sm text-text-muted dark:text-text-subtle">
              아직 메시지가 없습니다.
            </p>
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border-base bg-surface px-3 py-3 dark:border-border-sub dark:bg-surface-muted"
      >
        {error ? (
          <p className="mb-2 text-sm text-accent-sub" role="status">
            {error}
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="메시지 입력"
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-border-base bg-surface-sub px-3 py-2 text-sm text-text-base outline-none transition placeholder:text-text-muted focus:border-accent-border dark:border-border-sub dark:bg-surface-strong dark:placeholder:text-text-subtle"
          />
          <input type="hidden" name="roomId" value={roomId} />
          <Button type="submit" size="icon-lg" disabled={!canSend} aria-label="메시지 보내기">
            <Send aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}
