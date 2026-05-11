"use client";

import { useState } from "react";

type PostReactionProps = {
  reactions: Array<{ emoji: string; count: number; userReacted: boolean }>;
  canInteract: boolean;
  togglePostReactionAction: (formData: FormData) => Promise<void>;
};

export function PostReaction({
  reactions,
  canInteract,
  togglePostReactionAction,
}: PostReactionProps) {
  const EMOJIS = ["❤️", "😂", "😮", "😢", "😡"];
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="space-y-3">
      {reactions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {reactions.map((reaction) => (
            <form key={reaction.emoji} action={togglePostReactionAction}>
              <input type="hidden" name="emoji" value={reaction.emoji} />
              <button
                type="submit"
                disabled={!canInteract}
                className={`rounded-full px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  reaction.userReacted
                    ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/50"
                    : "bg-surface-muted text-text-sub border border-border-base hover:bg-surface-strong"
                }`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            </form>
          ))}
        </div>
      ) : null}

      {canInteract ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((current) => !current)}
            className="rounded-full border border-border-base bg-surface-muted px-2 py-1 text-xs font-semibold text-text-sub transition hover:bg-surface-strong"
          >
            +
          </button>

          {showEmojiPicker ? (
            <div className="absolute left-0 top-8 z-10 flex flex-wrap gap-1 rounded-xl border border-border-base bg-surface-strong p-2 shadow-lg">
              {EMOJIS.map((emoji) => (
                <form
                  key={emoji}
                  action={async (formData) => {
                    await togglePostReactionAction(formData);
                    setShowEmojiPicker(false);
                  }}
                >
                  <input type="hidden" name="emoji" value={emoji} />
                  <button type="submit" className="rounded px-1 py-0.5 text-lg transition hover:bg-surface-muted">
                    {emoji}
                  </button>
                </form>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
