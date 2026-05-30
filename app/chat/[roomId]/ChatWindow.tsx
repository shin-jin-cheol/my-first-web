"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    openChat(roomId, otherUser.name, otherUser.avatarUrl ?? null);
    setMode("fullscreen");

    return () => {
      setMode("floating");
    };
  }, [openChat, otherUser.avatarUrl, otherUser.name, roomId, setMode]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ChatPanel
        roomId={roomId}
        initialMessages={initialMessages}
        currentUserId={currentUserId}
        otherUser={otherUser}
        chatImagesBucket={chatImagesBucket}
        showBackLink
      />
    </div>
  );
}
