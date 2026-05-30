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
    document.body.classList.add("chat-fullscreen-active");
    openChat(roomId, otherUser.name, otherUser.avatarUrl ?? null);
    setMode("fullscreen");

    return () => {
      document.body.classList.remove("chat-fullscreen-active");
      setMode("floating");
    };
  }, [openChat, otherUser.avatarUrl, otherUser.name, roomId, setMode]);

  function handleMinimizeChat() {
    openChat(roomId, otherUser.name, otherUser.avatarUrl ?? null);
    setMode("minimized");
    router.push("/friends");
  }

  return (
    <>
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
      <style jsx global>{`
        @media (max-width: 767px) {
          body.chat-fullscreen-active footer {
            padding-top: 0.5rem;
            padding-bottom: 0.625rem;
            font-size: 0.75rem;
          }

          body.chat-fullscreen-active footer > div {
            gap: 0.375rem;
          }

          body.chat-fullscreen-active footer > div > div {
            gap: 0.5rem;
          }

          body.chat-fullscreen-active footer a[class*="text-sm"] {
            font-size: 0.75rem;
          }

          body.chat-fullscreen-active footer a[class*="h-10"] {
            width: 2rem;
            height: 2rem;
          }
        }
      `}</style>
    </>
  );
}
