import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getMessages, getRoom, isChatRoomParticipant } from "@/lib/chat";
import ChatWindow from "@/app/chat/[roomId]/ChatWindow";

type ChatPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await requireSession();
  const { roomId } = await params;
  const decodedRoomId = decodeURIComponent(roomId);
  const room = await getRoom(decodedRoomId);

  if (!room || !isChatRoomParticipant(room, session.userId)) {
    notFound();
  }

  const initialMessages = await getMessages(decodedRoomId);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-3xl flex-col gap-4">
      <ChatWindow
        roomId={decodedRoomId}
        initialMessages={initialMessages}
        currentUserId={session.userId}
      />
    </section>
  );
}
