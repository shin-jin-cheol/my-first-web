type CommentLike = {
  id: number;
};

export function findCommentById<TComment extends CommentLike>(comments: TComment[] | undefined | null, commentId: number) {
  return comments?.find((comment) => comment.id === commentId);
}