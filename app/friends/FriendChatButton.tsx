"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getChatRoomAction } from "@/app/friends/actions";
import { Button } from "@/components/ui/button";

type FriendChatButtonProps = {
  friendId: string;
};

export function FriendChatButton({ friendId }: FriendChatButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openChat() {
    setError("");

    startTransition(async () => {
      try {
        const roomId = await getChatRoomAction(friendId);
        router.push(`/chat/${encodeURIComponent(roomId)}`);
      } catch {
        setError("채팅방을 열 수 없습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" onClick={openChat} disabled={isPending}>
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
