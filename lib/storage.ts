import { promises as fs } from "node:fs";
import path from "node:path";
import { list, put } from "@vercel/blob";
import {
  BLOB_READ_WRITE_TOKEN,
  IS_VERCEL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_UPLOADS_BUCKET,
  SUPABASE_URL,
} from "@/lib/env";
import {
  removeAttachment,
  saveAttachmentFile,
  type AttachmentRuntimeOptions,
} from "@/lib/attachment-utils";
import { safeJsonParse } from "@/lib/safe-json";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const blobUrlCache = new Map<string, string>();

type JsonStorageOptions<T, TResult = T> = {
  blobKey?: string;
  localFileName: string;
  tmpFileName: string;
  seedData: T;
  normalize?: (data: T) => TResult;
  useBlob?: boolean;
  logPrefix?: string;
};

export function hasBlobStorage() {
  return Boolean(BLOB_READ_WRITE_TOKEN);
}

export function hasSupabaseStorage() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export function resolveDataFilePath(localFileName: string, tmpFileName: string) {
  if (IS_VERCEL) {
    return path.join("/tmp", tmpFileName);
  }

  return path.join(DATA_DIR, localFileName);
}

export function getSupabaseStorageObjectEndpoint(pathname = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object`;
  return `${base}${pathname}`;
}

export function getSupabasePublicFileUrl(storagePath: string) {
  if (!SUPABASE_URL) {
    return "";
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${SUPABASE_UPLOADS_BUCKET}/${storagePath}`;
}

export function getAttachmentRuntimeOptions(): AttachmentRuntimeOptions {
  return {
    hasSupabaseStorage: hasSupabaseStorage(),
    supabaseServiceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
    supabaseUploadsBucket: SUPABASE_UPLOADS_BUCKET,
    getSupabaseStorageObjectEndpoint,
    getSupabasePublicFileUrl,
    hasBlobStorageToken: hasBlobStorage(),
    uploadsDir: UPLOADS_DIR,
  };
}

export function getStoragePublicUrl(storagePath: string) {
  return getSupabasePublicFileUrl(storagePath);
}

export async function saveFile(file: File | null | undefined) {
  return saveAttachmentFile(file, getAttachmentRuntimeOptions());
}

export async function deleteFile(fileUrl: string | undefined) {
  await removeAttachment(fileUrl, getAttachmentRuntimeOptions());
}

function pickLatestBlobUrl(
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

async function refreshBlobUrlCache(blobKey: string) {
  const existing = await list({ prefix: blobKey, limit: 100 });
  const exactPathBlobs = existing.blobs.filter((blob) => blob.pathname === blobKey);
  const nextUrl = pickLatestBlobUrl(exactPathBlobs.length > 0 ? exactPathBlobs : existing.blobs);

  if (nextUrl) {
    blobUrlCache.set(blobKey, nextUrl);
  } else {
    blobUrlCache.delete(blobKey);
  }
}

async function readJsonFromBlob<T, TResult = T>(options: JsonStorageOptions<T, TResult>): Promise<TResult> {
  const { blobKey, seedData, logPrefix } = options;
  if (!blobKey || !hasBlobStorage()) {
    return seedData as unknown as TResult;
  }

  await refreshBlobUrlCache(blobKey);
  let cachedUrl = blobUrlCache.get(blobKey);

  const seed = cachedUrl
    ? null
    : await put(blobKey, JSON.stringify(seedData, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
      }).catch(() => null);

  if (seed?.url) {
    blobUrlCache.set(blobKey, seed.url);
    cachedUrl = seed.url;
  }

  if (!cachedUrl) {
    return seedData as unknown as TResult;
  }

  const fetchUrl = `${cachedUrl}${cachedUrl.includes("?") ? "&" : "?"}ts=${Date.now()}`;
  let response = await fetch(fetchUrl, { cache: "no-store" });

  if (!response.ok) {
    await refreshBlobUrlCache(blobKey);
    cachedUrl = blobUrlCache.get(blobKey);

    if (!cachedUrl) {
      if (logPrefix) {
        console.error(`${logPrefix}: no blob URL after refresh, initial status=${response.status} ${response.statusText}`);
      }
      return seedData as unknown as TResult;
    }

    const retryUrl = `${cachedUrl}${cachedUrl.includes("?") ? "&" : "?"}ts=${Date.now()}`;
    response = await fetch(retryUrl, { cache: "no-store" });
    if (!response.ok) {
      if (logPrefix) {
        console.error(`${logPrefix}: retry fetch failed status=${response.status} ${response.statusText}`);
      }
      return seedData as unknown as TResult;
    }
  }

  const data = (await response.json()) as T;
  return options.normalize ? options.normalize(data) : (data as unknown as TResult);
}

async function writeJsonToBlob<T>(data: T, options: JsonStorageOptions<T>) {
  const { blobKey } = options;
  if (!blobKey || !hasBlobStorage()) {
    return;
  }

  const blob = await put(blobKey, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  blobUrlCache.set(blobKey, blob.url);
}

export async function ensureJsonStorage<T, TResult = T>(options: JsonStorageOptions<T, TResult>) {
  if (options.useBlob && hasBlobStorage()) {
    await readJsonFromBlob(options);
    return;
  }

  const filePath = resolveDataFilePath(options.localFileName, options.tmpFileName);
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(options.seedData, null, 2), "utf-8");
  }
}

export async function readJsonStorage<T, TResult = T>(options: JsonStorageOptions<T, TResult>): Promise<TResult> {
  if (options.useBlob && hasBlobStorage()) {
    return readJsonFromBlob(options);
  }

  await ensureJsonStorage(options);
  const raw = await fs.readFile(resolveDataFilePath(options.localFileName, options.tmpFileName), "utf-8");
  const parsed = safeJsonParse<T>(raw, options.seedData) ?? options.seedData;
  return options.normalize ? options.normalize(parsed) : (parsed as unknown as TResult);
}

export async function writeJsonStorage<T>(data: T, options: JsonStorageOptions<T>) {
  if (options.useBlob && hasBlobStorage()) {
    await writeJsonToBlob(data, options);
    return;
  }

  await fs.writeFile(
    resolveDataFilePath(options.localFileName, options.tmpFileName),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}
