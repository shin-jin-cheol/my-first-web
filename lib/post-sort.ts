export type PostSortKey = "latest" | "views" | "likes" | "comments";

export function normalizePostSort(value: string | null | undefined): PostSortKey {
  if (value === "views" || value === "likes" || value === "comments") {
    return value;
  }

  return "latest";
}
