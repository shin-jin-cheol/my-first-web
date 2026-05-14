import type { BlogPostCategory } from "@/lib/post-categories";
import type { GuestPostCategory } from "@/lib/post-categories";

export type OwnerPostItem = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  author: string;
  date: string;
  category: BlogPostCategory;
  categoryLabel: string;
  detailHref: string;
  views: number;
};

export type CommunityPostItem = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorDisplay: string;
  date: string;
  detailHref: string;
  category: BlogPostCategory;
  categoryLabel: string;
  sourceLabel: string;
  views: number;
};

export type GuestPostItem = {
  id: number | string;
  title: string;
  content: string;
  authorId: string;
  authorDisplay: string;
  date: string;
  detailHref: string;
  canManage: boolean;
  category: GuestPostCategory;
  categoryLabel: string;
  editHref?: string;
  postId?: number;
};

export type CategoryOption<T> = {
  value: "all" | T;
  label: string;
};
