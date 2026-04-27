export const BLOG_POST_CATEGORIES = ["study", "daily", "info", "notice"] as const;
export const GUEST_POST_CATEGORIES = ["study", "daily", "info"] as const;

export type BlogPostCategory = (typeof BLOG_POST_CATEGORIES)[number];
export type GuestPostCategory = (typeof GUEST_POST_CATEGORIES)[number];

export function isBlogPostCategory(value: string): value is BlogPostCategory {
  return BLOG_POST_CATEGORIES.includes(value as BlogPostCategory);
}

export function isGuestPostCategory(value: string): value is GuestPostCategory {
  return GUEST_POST_CATEGORIES.includes(value as GuestPostCategory);
}

export function normalizeBlogPostCategory(value?: string): BlogPostCategory {
  if (value && isBlogPostCategory(value)) {
    return value;
  }

  return "study";
}

export function normalizeGuestPostCategory(value?: string): GuestPostCategory {
  if (value && isGuestPostCategory(value)) {
    return value;
  }

  return "study";
}

export function getCategoryLabel(category: BlogPostCategory | GuestPostCategory) {
  switch (category) {
    case "study":
      return "공부";
    case "daily":
      return "일상";
    case "info":
      return "정보";
    case "notice":
      return "공지";
    default:
      return "공부";
  }
}
