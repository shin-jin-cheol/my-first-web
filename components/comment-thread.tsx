"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAvatarColorClass, getAvatarText } from "@/lib/avatar-utils";

const EMOJIS = ["\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDE21"];

export type CommentThreadItem = {
  id: number;
  authorId: string;
  authorName: string;
  content: string;
  dateTime: string;
  parentId?: number;
  canManage: boolean;
  reactions?: Array<{ emoji: string; count: number; userReacted: boolean }>;
};

type CommentThreadLabels = {
  title: string;
  prompt: string;
  submit: string;
  reply: string;
  replyPlaceholder: string;
  replySubmit: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  noComments: string;
  loginToComment: string;
};

type CommentThreadProps = {
  postId: number;
  comments: CommentThreadItem[];
  canInteract: boolean;
  labels: CommentThreadLabels;
  addCommentAction: (formData: FormData) => Promise<void>;
  addReplyAction: (parentCommentId: number, formData: FormData) => Promise<void>;
  updateCommentAction: (formData: FormData) => Promise<void>;
  deleteCommentAction: (formData: FormData) => Promise<void>;
  toggleCommentReactionAction?: (formData: FormData) => Promise<void>;
};

type CommentTreeNode = CommentThreadItem & {
  replies: CommentTreeNode[];
};

function CommentAvatar({ name }: { name: string }) {
  const avatarText = getAvatarText(name);
  const avatarColor = getAvatarColorClass(name);

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: avatarColor }}
    >
      {avatarText}
    </div>
  );
}

function buildTree(comments: CommentThreadItem[]): CommentTreeNode[] {
  const nodes = new Map<number, CommentTreeNode>();
  const roots: CommentTreeNode[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id);
    if (!node) {
      continue;
    }

    if (typeof comment.parentId === "number") {
      const parent = nodes.get(comment.parentId);
      if (parent) {
        parent.replies.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  return roots;
}

export function CommentThread({
  postId,
  comments,
  canInteract,
  labels,
  addCommentAction,
  addReplyAction,
  updateCommentAction,
  deleteCommentAction,
  toggleCommentReactionAction,
}: CommentThreadProps) {
  const tree = useMemo(() => buildTree(comments), [comments]);
  const [replyingCommentId, setReplyingCommentId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [menuCommentId, setMenuCommentId] = useState<number | null>(null);
  const [showEmojiPickerId, setShowEmojiPickerId] = useState<number | null>(null);

  const startReply = (commentId: number) => {
    setReplyingCommentId((current) => (current === commentId ? null : commentId));
    setEditingCommentId(null);
    setMenuCommentId(null);
  };

  const startEdit = (commentId: number) => {
    setEditingCommentId(commentId);
    setReplyingCommentId(null);
    setMenuCommentId(null);
  };

  const toggleMenu = (commentId: number) => {
    setMenuCommentId((current) => (current === commentId ? null : commentId));
    setReplyingCommentId(null);
  };

  const handleReaction = async (commentId: number, emoji: string) => {
    if (!toggleCommentReactionAction) {
      return;
    }

    const formData = new FormData();
    formData.append("postId", String(postId));
    formData.append("commentId", String(commentId));
    formData.append("emoji", emoji);
    await toggleCommentReactionAction(formData);
    setShowEmojiPickerId(null);
  };

  const renderComment = (comment: CommentTreeNode, depth = 0) => {
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingCommentId === comment.id;
    const isMenuOpen = menuCommentId === comment.id;
    const isRoot = depth === 0;

    return (
      <div key={comment.id} className={depth === 0 ? "rounded-2xl border border-border-base bg-surface-sub/90 p-4" : "rounded-xl border border-border-sub/60 bg-surface/70 p-3"}>
        <div className="flex items-start gap-3">
          <CommentAvatar name={comment.authorName} />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-sub">{comment.authorName}</p>
                <p className="text-xs text-text-muted">{comment.dateTime}</p>
              </div>

              {comment.canManage ? (
                <div className="relative flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMenu(comment.id)}
                    aria-label={labels.edit}
                    className="rounded-full px-2 py-1 text-sm font-bold text-text-muted transition hover:bg-surface-muted hover:text-text-sub"
                  >
                    ...
                  </button>

                  {isMenuOpen ? (
                    <div className="absolute right-0 top-9 z-10 min-w-28 overflow-hidden rounded-xl border border-border-base bg-surface-strong shadow-lg">
                      <button
                        type="button"
                        onClick={() => startEdit(comment.id)}
                        className="block w-full px-3 py-2 text-left text-sm text-text-sub transition hover:bg-surface-muted"
                      >
                        {labels.edit}
                      </button>
                      <form action={deleteCommentAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button
                          type="submit"
                          className="block w-full px-3 py-2 text-left text-sm text-danger-sub transition hover:bg-danger-soft/20"
                        >
                          {labels.delete}
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {isEditing ? (
              <form action={updateCommentAction} className="space-y-3">
                <input type="hidden" name="commentId" value={comment.id} />
                <textarea
                  name="content"
                  defaultValue={comment.content}
                  required
                  minLength={1}
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-xl border border-border-base bg-surface-strong px-3 py-2 text-sm text-text-sub outline-none ring-accent-border placeholder:text-text-muted focus:ring"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" className="rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base">
                    {labels.save}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border border-border-base bg-surface-strong px-4 py-2 text-sm font-semibold text-text-sub"
                    onClick={() => setEditingCommentId(null)}
                  >
                    {labels.cancel}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-6 text-text-sub">{comment.content}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              {comment.reactions?.map((reaction) => (
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

              {canInteract && toggleCommentReactionAction ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPickerId((current) => (current === comment.id ? null : comment.id))}
                    aria-label="이모지 반응"
                    className="rounded-full border border-border-base bg-surface-muted px-2 py-1 text-xs font-semibold text-text-sub transition hover:bg-surface-strong"
                  >
                    {"\u2764\uFE0F"}
                  </button>

                  {showEmojiPickerId === comment.id ? (
                    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border-base bg-surface-strong p-1.5 shadow-lg">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(comment.id, emoji)}
                          className="rounded px-1 py-0.5 text-lg transition hover:bg-surface-muted"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            {canInteract && isRoot ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => startReply(comment.id)}
                  className="rounded-full border border-border-base bg-surface-strong px-3 py-1.5 text-xs font-semibold text-text-sub transition hover:bg-surface-muted"
                >
                  {labels.reply}
                </button>
              </div>
            ) : null}

            {canInteract && isReplying ? (
              <form action={addReplyAction.bind(null, comment.id)} className="space-y-3">
                <textarea
                  name="reply"
                  required
                  minLength={1}
                  maxLength={500}
                  rows={3}
                  placeholder={labels.replyPlaceholder}
                  className="w-full rounded-xl border border-border-base bg-surface-strong px-3 py-2 text-sm text-text-sub outline-none ring-accent-border placeholder:text-text-muted focus:ring"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" className="rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base">
                    {labels.replySubmit}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border border-border-base bg-surface-strong px-4 py-2 text-sm font-semibold text-text-sub"
                    onClick={() => setReplyingCommentId(null)}
                  >
                    {labels.cancel}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </div>

        {comment.replies.length > 0 ? (
          <div className="mt-4 space-y-3 border-l border-border-base pl-4">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border-base/80 bg-surface-strong/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text-sub">{labels.title}</h2>
        <span className="text-xs text-text-muted">{labels.prompt}</span>
      </div>

      {canInteract ? (
        <form action={addCommentAction} className="space-y-3">
          <textarea
            name="comment"
            required
            minLength={1}
            maxLength={500}
            rows={4}
            placeholder={labels.prompt}
            className="w-full rounded-2xl border border-border-base bg-surface-sub px-3 py-2 text-sm text-text-sub outline-none ring-accent-border placeholder:text-text-muted focus:ring"
          />
          <Button type="submit" className="rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base">
            {labels.submit}
          </Button>
        </form>
      ) : (
        <p className="rounded-2xl border border-border-base bg-surface-sub px-4 py-3 text-sm text-text-muted">
          {labels.loginToComment}
        </p>
      )}

      {tree.length > 0 ? (
        <div className="space-y-3">{tree.map((comment) => renderComment(comment))}</div>
      ) : (
        <p className="text-sm text-text-muted">{labels.noComments}</p>
      )}
    </section>
  );
}
