import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeCategory(category: string, type: 'guest'): 'daily' | 'info' | 'study';
export function normalizeCategory(category: string, type: 'blog'): 'notice' | 'daily' | 'info' | 'study';
export function normalizeCategory(category: string, type: 'guest' | 'blog'): 'daily' | 'info' | 'study' | 'notice' {
  if (type === 'guest') {
    return category === "daily" ? "daily" : category === "info" ? "info" : "study";
  } else {
    return category === "notice" ? "notice" : category === "daily" ? "daily" : category === "info" ? "info" : "study";
  }
}

export function normalizeAttachment(file: unknown): File | null {
  return file instanceof File ? file : null;
}
