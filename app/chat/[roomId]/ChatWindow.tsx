"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Expand,
  ImagePlus,
  MessageCircle,
  Minus,
  Send,
  Shrink,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { sendChatMessageAction } from "@/app/chat/[roomId]/actions";
import { UserAvatar } from "@/app/components/UserAvatar";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/chat";
import { supabaseBrowserClient } from "@/lib/supabase/client";

const supabase = supabaseBrowserClient;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

type ChatMode = "fullscreen" | "floating" | "minimized";

type ChatUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type ChatWindowProps = {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  otherUser: ChatUser;
  chatImagesBucket: string;
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

function getFileExtension(file: File) {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/gif") {
    return "gif";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "bin";
}

export default function ChatWindow({
  roomId,
  initialMessages,
  currentUserId,
  otherUser,
  chatImagesBucket,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ChatMode>("fullscreen");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [pendingImageName, setPendingImageName] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const trimmedContent = content.trim();
  const canSend = Boolean((trimmedContent || pendingImageUrl) && !isPending && !isUploadingImage);
  const effectiveMode: ChatMode = isMobileViewport ? "fullscreen" : mode;

  const messageCountLabel = useMemo(() => `${messages.length} messages`, [messages.length]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const applyViewport = (event: MediaQueryList | MediaQueryListEvent) => {
      const isMobile = event.matches;
      setIsMobileViewport(isMobile);
      if (isMobile) {
        setMode("fullscreen");
      }
    };

    applyViewport(mediaQuery);
    const onChange = (event: MediaQueryListEvent) => applyViewport(event);
    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

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
    listEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, effectiveMode]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 전송할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("이미지는 10MB 이하만 전송할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);

    try {
      const path = `${roomId}/${Date.now()}.${getFileExtension(file)}`;
      const { error: uploadError } = await supabase.storage.from(chatImagesBucket).upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from(chatImagesBucket).getPublicUrl(path);
      setPendingImageUrl(data.publicUrl);
      setPendingImageName(file.name);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedContent && !pendingImageUrl) {
      return;
    }

    const nextContent = trimmedContent;
    const nextImageUrl = pendingImageUrl;
    const nextImageName = pendingImageName;
    const formData = new FormData();
    formData.set("roomId", roomId);
    formData.set("content", nextContent);
    formData.set("imageUrl", nextImageUrl);

    setError("");
    setContent("");
    setPendingImageUrl("");
    setPendingImageName("");

    startTransition(async () => {
      const message = await sendChatMessageAction(formData);
      if (!message) {
        setError("메시지를 보낼 수 없습니다.");
        setContent(nextContent);
        setPendingImageUrl(nextImageUrl);
        setPendingImageName(nextImageName);
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

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    if (canSend) {
      formRef.current?.requestSubmit();
    }
  }

  if (effectiveMode === "minimized") {
    return (
      <button
        type="button"
        onClick={() => setMode("floating")}
        className="fixed bottom-5 right-5 z-50 hidden max-w-72 items-center gap-2 rounded-full border border-border-base bg-surface-muted/95 px-4 py-3 text-sm font-semibold text-text-sub shadow-[0_10px_24px_rgb(from_var(--foreground)_r_g_b_/_0.14)] backdrop-blur transition hover:bg-surface-sub hover:text-text-base dark:border-border-sub dark:bg-surface-sub/90 dark:shadow-[0_10px_24px_rgb(from_var(--foreground)_r_g_b_/_0.08)] md:flex"
        aria-label={`${otherUser.name} 채팅 열기`}
      >
        <MessageCircle aria-hidden="true" size={18} />
        <span className="truncate">{otherUser.name}</span>
      </button>
    );
  }

  const containerClass =
    effectiveMode === "floating"
      ? "md:fixed md:bottom-5 md:right-5 md:z-50 md:h-[min(70vh,560px)] md:w-80"
      : "h-full w-full";

  return (
    <div
      className={`${containerClass} flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-base bg-surface-sub shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] dark:border-border-base dark:bg-surface-strong`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border-base px-4 py-3 dark:border-border-sub">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/friends"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-base bg-surface text-text-sub transition hover:bg-surface-muted hover:text-text-base dark:border-border-sub dark:bg-surface-muted"
            aria-label="친구 목록으로 돌아가기"
          >
            <ArrowLeft aria-hidden="true" size={17} />
          </Link>
          <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={36} />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-text-base">{otherUser.name}</h1>
            <p className="truncate text-xs text-text-muted dark:text-text-subtle">
              {messageCountLabel}
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-1 md:flex">
          {effectiveMode === "fullscreen" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMode("floating")}
              aria-label="채팅창 축소"
              title="Floating"
              className="rounded-full"
            >
              <Shrink aria-hidden="true" size={17} />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMode("fullscreen")}
                aria-label="채팅창 전체화면"
                title="Fullscreen"
                className="rounded-full"
              >
                <Expand aria-hidden="true" size={17} />
              </Button>
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
            </>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {messages.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const hasImage = Boolean(message.image_url);
              const hasText = message.content.trim().length > 0;

              return (
                <li
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[min(78%,36rem)] overflow-hidden rounded-2xl border ${
                      isOwnMessage
                        ? "border-accent-border bg-accent-soft text-text-base"
                        : "border-border-base bg-surface text-text-base dark:border-border-sub dark:bg-surface-muted"
                    }`}
                  >
                    {hasImage ? (
                      <Image
                        src={message.image_url || ""}
                        alt="채팅 이미지"
                        width={320}
                        height={240}
                        className="max-h-72 w-full object-cover"
                        unoptimized
                      />
                    ) : null}
                    {hasText ? (
                      <p className="whitespace-pre-wrap break-words px-4 pt-2 text-sm leading-6">
                        {message.content}
                      </p>
                    ) : null}
                    <p className="px-4 pb-2 pt-1 text-right text-[0.7rem] text-text-muted dark:text-text-subtle">
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
        ref={formRef}
        onSubmit={handleSubmit}
        className="border-t border-border-base bg-surface px-3 py-3 dark:border-border-sub dark:bg-surface-muted"
      >
        {error ? (
          <p className="mb-2 text-sm text-danger-sub" role="status">
            {error}
          </p>
        ) : null}
        {pendingImageUrl ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border-base bg-surface-sub p-2 dark:border-border-sub dark:bg-surface-strong">
            <Image
              src={pendingImageUrl}
              alt="전송할 이미지"
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-cover"
              unoptimized
            />
            <p className="min-w-0 flex-1 truncate text-xs text-text-sub dark:text-text-sub">
              {pendingImageName || "이미지"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setPendingImageUrl("");
                setPendingImageName("");
              }}
              className="rounded-full"
            >
              취소
            </Button>
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          <Button
            type="button"
            size="icon-lg"
            variant="secondary"
            disabled={isUploadingImage || isPending}
            onClick={() => imageInputRef.current?.click()}
            aria-label="사진 선택"
          >
            <ImagePlus aria-hidden="true" />
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
            disabled={isUploadingImage || isPending}
          />
          <textarea
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isUploadingImage ? "이미지 업로드 중..." : "메시지 입력"}
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
