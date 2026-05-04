import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pickLatestBlobUrl(
  blobs: Array<{ url: string; uploadedAt?: string | Date; pathname?: string }>,
): string | undefined {
  if (blobs.length === 0) {
    return undefined;
  }

  const sorted = [...blobs].sort((a, b) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : Number.MIN_SAFE_INTEGER;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : Number.MIN_SAFE_INTEGER;
    return bTime - aTime;
  });

  return sorted[0]?.url;
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
