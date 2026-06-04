import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/html",
  "video/mp4",
]);

type SupabaseAttachmentOptions = {
  supabaseServiceRoleKey?: string;
  supabaseUploadsBucket: string;
  getSupabaseStorageObjectEndpoint: (pathname?: string) => string;
  getSupabasePublicFileUrl: (storagePath: string) => string;
};

export type AttachmentRuntimeOptions = SupabaseAttachmentOptions & {
  hasSupabaseStorage: boolean;
  hasBlobStorageToken: boolean;
  uploadsDir: string;
};

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isHttpOrHttpsUrl(input: string): boolean {
  try {
    const parsedUrl = new URL(input);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrlCandidate(input: string): string | undefined {
  const trimmed = input.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return isHttpOrHttpsUrl(trimmed) ? trimmed : undefined;
  }

  const candidate = `https://${trimmed}`;
  return isHttpOrHttpsUrl(candidate) ? candidate : undefined;
}

async function uploadAttachmentToSupabaseStorage(
  file: File,
  uniqueName: string,
  options: SupabaseAttachmentOptions,
): Promise<{ fileUrl: string; fileName: string } | undefined> {
  if (!options.supabaseServiceRoleKey) {
    return undefined;
  }

  const storagePath = `uploads/${uniqueName}`;
  const response = await fetch(
    options.getSupabaseStorageObjectEndpoint(`/${options.supabaseUploadsBucket}/${storagePath}`),
    {
      method: "POST",
      headers: {
        apikey: options.supabaseServiceRoleKey,
        Authorization: `Bearer ${options.supabaseServiceRoleKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: Buffer.from(await file.arrayBuffer()),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return undefined;
  }

  return {
    fileUrl: options.getSupabasePublicFileUrl(storagePath),
    fileName: file.name || uniqueName,
  };
}

function extractSupabaseStoragePath(fileUrl: string | undefined, supabaseUploadsBucket: string) {
  if (!fileUrl) {
    return undefined;
  }

  const publicPrefix = `/storage/v1/object/public/${supabaseUploadsBucket}/`;
  const privatePrefix = `/storage/v1/object/${supabaseUploadsBucket}/`;

  try {
    const parsed = new URL(fileUrl);
    if (parsed.pathname.startsWith(publicPrefix)) {
      return parsed.pathname.slice(publicPrefix.length);
    }

    if (parsed.pathname.startsWith(privatePrefix)) {
      return parsed.pathname.slice(privatePrefix.length);
    }

    return undefined;
  } catch {
    if (fileUrl.startsWith(publicPrefix)) {
      return fileUrl.slice(publicPrefix.length);
    }

    if (fileUrl.startsWith(privatePrefix)) {
      return fileUrl.slice(privatePrefix.length);
    }

    return undefined;
  }
}

async function removeSupabaseAttachment(fileUrl: string | undefined, options: SupabaseAttachmentOptions) {
  if (!options.supabaseServiceRoleKey) {
    return;
  }

  const storagePath = extractSupabaseStoragePath(fileUrl, options.supabaseUploadsBucket);
  if (!storagePath) {
    return;
  }

  try {
    await fetch(options.getSupabaseStorageObjectEndpoint(`/${options.supabaseUploadsBucket}/${storagePath}`), {
      method: "DELETE",
      headers: {
        apikey: options.supabaseServiceRoleKey,
        Authorization: `Bearer ${options.supabaseServiceRoleKey}`,
      },
      cache: "no-store",
    });
  } catch {
    // no-op when deletion fails or file already removed
  }
}

async function ensureUploadsDir(uploadsDir: string) {
  await fs.mkdir(uploadsDir, { recursive: true });
}

async function removeLocalAttachment(fileUrl?: string) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
  try {
    await fs.unlink(filePath);
  } catch {
    // no-op when file does not exist
  }
}

export async function saveAttachmentFile(
  file: File | null | undefined,
  options: AttachmentRuntimeOptions,
): Promise<{ fileUrl: string; fileName: string } | undefined> {
  if (!file || file.size === 0) {
    return undefined;
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error("첨부 파일은 10MB를 초과할 수 없습니다.");
  }

  if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
    throw new Error("허용되지 않는 첨부 파일 형식입니다.");
  }

  const safeName = sanitizeFileName(file.name || "upload.bin");
  const uniqueName = `${Date.now()}-${safeName}`;

  if (options.hasSupabaseStorage) {
    const uploaded = await uploadAttachmentToSupabaseStorage(file, uniqueName, options);
    if (uploaded) {
      return uploaded;
    }
  }

  if (options.hasBlobStorageToken) {
    const blob = await put(`uploads/${uniqueName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return {
      fileUrl: blob.url,
      fileName: file.name || safeName,
    };
  }

  await ensureUploadsDir(options.uploadsDir);

  const filePath = path.join(options.uploadsDir, uniqueName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, fileBuffer);

  return {
    fileUrl: `/uploads/${uniqueName}`,
    fileName: file.name || safeName,
  };
}

export async function removeAttachment(fileUrl: string | undefined, options: AttachmentRuntimeOptions) {
  if (!fileUrl) {
    return;
  }

  if (options.hasSupabaseStorage) {
    await removeSupabaseAttachment(fileUrl, options);
  }

  if (fileUrl.startsWith("/uploads/")) {
    await removeLocalAttachment(fileUrl);
    return;
  }

  if (options.hasBlobStorageToken) {
    try {
      await del(fileUrl);
    } catch {
      // no-op when deletion fails or file already removed
    }
  }
}

export function normalizeLinkUrl(input?: string): string | undefined {
  if (!input) {
    return undefined;
  }

  return normalizeUrlCandidate(input);
}

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function normalizeYouTubeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function getYouTubeVideoId(input?: string | null): string | undefined {
  if (!input) {
    return undefined;
  }

  const normalized = normalizeUrlCandidate(input);
  if (!normalized) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(normalized);
    const hostname = normalizeYouTubeHost(parsedUrl.hostname);

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : undefined;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId =
        parsedUrl.searchParams.get("v") ??
        (parsedUrl.pathname.startsWith("/embed/") ? parsedUrl.pathname.split("/")[2] : undefined);
      return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function normalizeYouTubeUrl(input?: string): string | undefined {
  const normalized = input ? normalizeUrlCandidate(input) : undefined;
  if (!normalized || !getYouTubeVideoId(normalized)) {
    return undefined;
  }

  return normalized;
}

export function getYouTubeEmbedUrl(input?: string | null): string | undefined {
  const videoId = getYouTubeVideoId(input);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined;
}
