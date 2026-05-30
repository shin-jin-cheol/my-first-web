"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getChatRoomAction } from "@/app/friends/actions";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/context/ChatContext";

type FriendChatButtonProps = {
  friendId: string;
  partnerName: string;
  partnerAvatarUrl?: string | null;
};

export function FriendChatButton({
  friendId,
  partnerName,
  partnerAvatarUrl = null,
}: FriendChatButtonProps) {
  const router = useRouter();
  const { openChat: openFloatingChat } = useChat();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChat() {
    setError("");

    startTransition(async () => {
      try {
        const roomId = await getChatRoomAction(friendId);
        const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;

        if (isMobileViewport) {
          router.push(`/chat/${encodeURIComponent(roomId)}`);
          return;
        }

        openFloatingChat(roomId, partnerName, partnerAvatarUrl);
      } catch {
        setError("채팅방을 열 수 없습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" onClick={handleOpenChat} disabled={isPending}>
        <MessageCircle aria-hidden="true" />
        채팅
      </Button>
      {error ? (
        <p className="max-w-32 text-right text-xs text-accent-sub" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
