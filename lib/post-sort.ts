export type PostSortKey = "latest" | "views" | "likes" | "comments";

export function normalizePostSort(value: string | null | undefined): PostSortKey {
  if (value === "views" || value === "likes" || value === "comments") {
    return value;
  }

  return "latest";
}

export function getPostSortColumn(sort: PostSortKey) {
  switch (sort) {
    case "views":
      return "view_count";
    case "likes":
      return "like_count";
    case "comments":
      return "comment_count";
    case "latest":
    default:
      return "date";
  }
}

export function getPostSortOrder(sort: PostSortKey) {
  return `${getPostSortColumn(sort)}.desc`;
}
