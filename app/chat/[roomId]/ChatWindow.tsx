"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minimize2 } from "lucide-react";
import { ChatPanel, type ChatUser } from "@/app/components/ChatPanel";
import { useChat } from "@/lib/context/ChatContext";
import type { Message } from "@/lib/chat";

type ChatWindowProps = {
  roomId: string;
  initialMessages: Message[];
  currentUserId: string;
  otherUser: ChatUser;
  chatImagesBucket: string;
};

export default function ChatWindow({
  roomId,
  initialMessages,
  currentUserId,
  otherUser,
  chatImagesBucket,
}: ChatWindowProps) {
  const { openChat, setMode } = useChat();
  const router = useRouter();

  useEffect(() => {
    openChat(roomId, otherUser.name, otherUser.avatarUrl ?? null);
    setMode("fullscreen");

    return () => {
      setMode("floating");
    };
  }, [openChat, otherUser.avatarUrl, otherUser.name, roomId, setMode]);

  function handleMinimizeChat() {
    openChat(roomId, otherUser.name, otherUser.avatarUrl ?? null);
    setMode("minimized");

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ChatPanel
        roomId={roomId}
        initialMessages={initialMessages}
        currentUserId={currentUserId}
        otherUser={otherUser}
        chatImagesBucket={chatImagesBucket}
        headerActions={
          <button
            type="button"
            onClick={handleMinimizeChat}
            aria-label="채팅방 최소화"
            title="Minimize"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-primary)] transition hover:bg-[var(--color-background-secondary)] md:hidden"
          >
            <Minimize2 aria-hidden="true" size={17} />
          </button>
        }
        showBackLink
      />
    </div>
  );
}
