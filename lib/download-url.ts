import { SUPABASE_URL } from "@/lib/env";

function getConfiguredSupabaseOrigin() {
  if (!SUPABASE_URL) {
    return undefined;
  }

  try {
    return new URL(SUPABASE_URL).origin;
  } catch {
    return undefined;
  }
}

function isAllowedSupabaseStorageUrl(fileUrl: string) {
  const publicStoragePath = "/storage/v1/object/public/";
  const privateStoragePath = "/storage/v1/object/";

  if (fileUrl.startsWith(publicStoragePath) || fileUrl.startsWith(privateStoragePath)) {
    return true;
  }

  try {
    const parsed = new URL(fileUrl);
    const isStoragePath =
      parsed.pathname.startsWith(publicStoragePath) ||
      parsed.pathname.startsWith(privateStoragePath);

    if (!isStoragePath || parsed.protocol !== "https:") {
      return false;
    }

    const configuredOrigin = getConfiguredSupabaseOrigin();
    if (configuredOrigin) {
      return parsed.origin === configuredOrigin;
    }

    return parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function isAllowedBlobUrl(fileUrl: string) {
  try {
    const parsed = new URL(fileUrl);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function isAllowedDownloadSource(fileUrl: string) {
  return (
    fileUrl.startsWith("/uploads/") ||
    isAllowedSupabaseStorageUrl(fileUrl) ||
    isAllowedBlobUrl(fileUrl)
  );
}

export function buildDownloadUrl(fileUrl: string, fileName?: string | null) {
  if (!isAllowedDownloadSource(fileUrl)) {
    return null;
  }

  return `${fileUrl}${fileUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(fileName ?? "attachment")}`;
}
