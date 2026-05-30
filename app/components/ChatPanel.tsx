"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Send } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { sendChatMessageAction } from "@/app/chat/[roomId]/actions";
import { UserAvatar } from "@/app/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/context/PlayerContext";
import type { Message } from "@/lib/chat";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const GROUP_GAP_MS = 60 * 1000;

export type ChatUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type ChatPanelProps = {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  otherUser: ChatUser;
  chatImagesBucket: string;
  headerActions?: ReactNode;
  showBackLink?: boolean;
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

function getMessageTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
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

function shouldShowTimeSeparator(messages: Message[], index: number) {
  if (index === 0) {
    return true;
  }

  const previous = messages[index - 1];
  const current = messages[index];
  return getMessageTime(current.created_at) - getMessageTime(previous.created_at) >= GROUP_GAP_MS;
}

function shouldShowPartnerAvatar(messages: Message[], index: number, currentUserId: string) {
  const current = messages[index];
  if (current.sender_id === currentUserId) {
    return false;
  }

  const next = messages[index + 1];
  if (!next || next.sender_id !== current.sender_id) {
    return true;
  }

  return getMessageTime(next.created_at) - getMessageTime(current.created_at) >= GROUP_GAP_MS;
}

export function ChatPanel({
  roomId,
  initialMessages,
  currentUserId,
  otherUser,
  chatImagesBucket,
  headerActions,
  showBackLink = true,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [pendingImageName, setPendingImageName] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const { isMinimized: isPlayerMinimized } = usePlayer();

  const trimmedContent = content.trim();
  const canSend = Boolean((trimmedContent || pendingImageUrl) && !isPending && !isUploadingImage);
  const formPaddingClass = isPlayerMinimized ? "pb-16 md:pb-3" : "pb-40 md:pb-3";

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const addMessage = (message: Message) => {
      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
          return currentMessages;
        }

        return [...currentMessages, message].sort(
          (first, second) =>
            getMessageTime(first.created_at) - getMessageTime(second.created_at),
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
  }, [messages]);

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
      const supabase = getSupabaseBrowserClient();
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--border-radius-lg)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] text-[var(--color-text-primary)] shadow-[0_4px_16px_rgb(0_0_0_/_0.1)]">
      <header className="shrink-0 flex items-center justify-between gap-3 border-b-[0.5px] border-[var(--color-border-tertiary)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {showBackLink ? (
            <Link
              href="/friends"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-secondary)]"
              aria-label="친구 목록으로 돌아가기"
            >
              <ArrowLeft aria-hidden="true" size={17} />
            </Link>
          ) : null}
          <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={36} />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-[var(--color-text-primary)]">{otherUser.name}</h1>
          </div>
        </div>

        {headerActions ? (
          <div className="shrink-0">{headerActions}</div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 md:px-4">
          {messages.length > 0 ? (
            <ol className="flex flex-col gap-1">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === currentUserId;
                const hasImage = Boolean(message.image_url);
                const hasText = message.content.trim().length > 0;
                const showTimeSeparator = shouldShowTimeSeparator(messages, index);
                const showPartnerAvatar = shouldShowPartnerAvatar(messages, index, currentUserId);

                return (
                  <li key={message.id} className="space-y-2">
                    {showTimeSeparator ? (
                      <div className="flex justify-center py-2">
                        <span className="rounded-full border border-border-base bg-surface px-3 py-1 text-[0.7rem] font-medium text-text-muted dark:border-border-sub dark:bg-surface-muted dark:text-text-subtle">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                    ) : null}
                    <div className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      {!isOwnMessage ? (
                        showPartnerAvatar ? (
                          <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size={32} />
                        ) : (
                          <span aria-hidden="true" className="h-8 w-8 shrink-0" />
                        )
                      ) : null}
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
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border-base bg-surface dark:border-border-sub dark:bg-surface-muted">
              <p className="text-sm text-text-muted dark:text-text-subtle">아직 메시지가 없습니다.</p>
            </div>
          )}
          <div ref={listEndRef} />
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`shrink-0 border-t-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-3 ${formPaddingClass}`}
        >
          {error ? (
            <p className="mb-2 text-sm text-danger-sub" role="status">
              {error}
            </p>
          ) : null}
          {pendingImageUrl ? (
            <div className="mb-2 flex items-center gap-2 rounded-[calc(var(--border-radius-lg)*0.75)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-2">
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
              className="max-h-32 min-h-10 flex-1 resize-none rounded-[calc(var(--border-radius-lg)*0.75)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-text-muted focus:border-accent-border dark:placeholder:text-text-subtle"
            />
            <input type="hidden" name="roomId" value={roomId} />
            <Button type="submit" size="icon-lg" disabled={!canSend} aria-label="메시지 보내기">
              <Send aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="shrink-0 border-t-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-3"
      >
        {error ? (
          <p className="mb-2 text-sm text-danger-sub" role="status">
            {error}
          </p>
        ) : null}
        {pendingImageUrl ? (
          <div className="mb-2 flex items-center gap-2 rounded-[calc(var(--border-radius-lg)*0.75)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-2">
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
            className="max-h-32 min-h-10 flex-1 resize-none rounded-[calc(var(--border-radius-lg)*0.75)] border-[0.5px] border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-text-muted focus:border-accent-border dark:placeholder:text-text-subtle"
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
