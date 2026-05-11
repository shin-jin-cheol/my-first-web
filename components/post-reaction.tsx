"use client";

import { useState } from "react";

const EMOJIS = ["\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDE21"];

type PostReactionProps = {
  postId: number;
  reactions: Array<{ emoji: string; count: number; userReacted: boolean }>;
  canInteract: boolean;
  togglePostReactionAction: (formData: FormData) => Promise<void>;
};

export function PostReaction({
  postId,
  reactions,
  canInteract,
  togglePostReactionAction,
}: PostReactionProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {reactions.map((reaction) => (
        <span
          key={reaction.emoji}
          className={`rounded-full border px-2 py-1 text-xs font-semibold ${
            reaction.userReacted
              ? "border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
              : "border-border-base bg-surface-muted text-text-sub"
          }`}
        >
          {reaction.emoji} {reaction.count}
        </span>
      ))}

      {canInteract ? (
        <>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((current) => !current)}
            aria-label="이모지 반응"
            className="rounded-full border border-border-base bg-surface-muted px-2 py-1 text-xs font-semibold text-text-sub transition hover:bg-surface-strong"
          >
            {"\u2764\uFE0F"}
          </button>

          {showEmojiPicker ? (
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border-base bg-surface-strong p-1.5 shadow-lg">
              {EMOJIS.map((emoji) => (
                <form key={emoji} action={togglePostReactionAction}>
                  <input type="hidden" name="postId" value={postId} />
                  <input type="hidden" name="emoji" value={emoji} />
                  <button type="submit" className="rounded px-1 py-0.5 text-lg transition hover:bg-surface-muted">
                    {emoji}
                  </button>
                </form>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
