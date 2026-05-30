import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getMemberById, ownerAccount } from "@/lib/auth/core";
import { getMessages, getRoom, isChatRoomParticipant } from "@/lib/chat";
import { SUPABASE_CHAT_IMAGES_BUCKET } from "@/lib/env";
import { getOwnerAvatarUrl } from "@/lib/owner-settings";
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
  const otherUserId = room.user_a_id === session.userId ? room.user_b_id : room.user_a_id;
  const isOwner = otherUserId === ownerAccount.id;
  const [otherMember, ownerAvatarUrl] = await Promise.all([
    isOwner ? Promise.resolve(undefined) : getMemberById(otherUserId),
    isOwner ? getOwnerAvatarUrl() : Promise.resolve(null),
  ]);

  const otherUser = {
    id: otherUserId,
    name: isOwner ? ownerAccount.name || otherUserId : otherMember?.name || otherUserId,
    avatarUrl: isOwner ? ownerAvatarUrl : otherMember?.avatarUrl ?? null,
  };

  return (
    <section className="fixed inset-x-0 bottom-0 top-[4.25rem] flex overflow-hidden md:top-[5rem]">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col pb-24">
        <ChatWindow
          roomId={decodedRoomId}
          initialMessages={initialMessages}
          currentUserId={session.userId}
          otherUser={otherUser}
          chatImagesBucket={SUPABASE_CHAT_IMAGES_BUCKET}
        />
      </div>
    </section>
  );
}
