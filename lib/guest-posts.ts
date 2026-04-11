import { promises as fs } from "node:fs";
import path from "node:path";
import { del, list, put } from "@vercel/blob";

export type GuestPost = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  date: string;
  linkUrl?: string;
  fileUrl?: string;
  fileName?: string;
};

type NewGuestPostInput = {
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  linkUrl?: string;
  attachmentFile?: File | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const GUEST_POSTS_FILE_LOCAL = path.join(DATA_DIR, "guest-posts.json");
const GUEST_POSTS_FILE_TMP = path.join("/tmp", "my-first-web-guest-posts.json");
const GUEST_POSTS_BLOB_KEY = "guest/guest-posts.json";
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

let guestPostsBlobUrlCache: string | undefined;

function pickLatestBlobUrl(blobs: Array<{ url: string; uploadedAt?: string | Date; pathname?: string }>): string | undefined {
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

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function refreshGuestPostsBlobUrlCache() {
  const existing = await list({ prefix: GUEST_POSTS_BLOB_KEY, limit: 100 });
  const exactPathBlobs = existing.blobs.filter((blob) => blob.pathname === GUEST_POSTS_BLOB_KEY);
  guestPostsBlobUrlCache = pickLatestBlobUrl(exactPathBlobs.length > 0 ? exactPathBlobs : existing.blobs);
}

function resolveGuestPostsFilePath() {
  // Vercel deployment filesystem is read-only except /tmp.
  if (process.env.VERCEL) {
    return GUEST_POSTS_FILE_TMP;
  }
  return GUEST_POSTS_FILE_LOCAL;
}

function getKstDateString() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function normalizeLinkUrl(input?: string): string | undefined {
  if (!input) {
    return undefined;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function saveAttachmentFile(file?: File | null): Promise<{ fileUrl: string; fileName: string } | undefined> {
  if (!file || file.size === 0) {
    return undefined;
  }

  const safeName = sanitizeFileName(file.name || "upload.bin");
  const uniqueName = `${Date.now()}-${safeName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${uniqueName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return {
      fileUrl: blob.url,
      fileName: file.name || safeName,
    };
  }

  await ensureUploadsDir();
  const filePath = path.join(UPLOADS_DIR, uniqueName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, fileBuffer);

  return {
    fileUrl: `/uploads/${uniqueName}`,
    fileName: file.name || safeName,
  };
}

async function removeLocalAttachment(fileUrl?: string) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
  try {
    await fs.unlink(filePath);
  } catch {
    // no-op
  }
}

async function removeAttachment(fileUrl?: string) {
  if (!fileUrl) {
    return;
  }

  if (fileUrl.startsWith("/uploads/")) {
    await removeLocalAttachment(fileUrl);
    return;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(fileUrl);
    } catch {
      // no-op
    }
  }
}

async function readGuestPostsFromBlob(): Promise<GuestPost[]> {
  if (!hasBlobStorage()) {
    return [];
  }

  await refreshGuestPostsBlobUrlCache();

  const seed = guestPostsBlobUrlCache
    ? null
    : await put(GUEST_POSTS_BLOB_KEY, JSON.stringify([], null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
      }).catch(() => null);

  if (seed?.url) {
    guestPostsBlobUrlCache = seed.url;
  }

  if (!guestPostsBlobUrlCache) {
    return [];
  }

  const fetchUrl = `${guestPostsBlobUrlCache}${guestPostsBlobUrlCache.includes("?") ? "&" : "?"}ts=${Date.now()}`;
  let response = await fetch(fetchUrl, { cache: "no-store" });
  if (!response.ok) {
    await refreshGuestPostsBlobUrlCache();

    if (!guestPostsBlobUrlCache) {
      return [];
    }

    const retryUrl = `${guestPostsBlobUrlCache}${guestPostsBlobUrlCache.includes("?") ? "&" : "?"}ts=${Date.now()}`;
    response = await fetch(retryUrl, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
  }

  const data = (await response.json()) as GuestPost[];
  return Array.isArray(data) ? data : [];
}

async function writeGuestPostsToBlob(posts: GuestPost[]) {
  if (!hasBlobStorage()) {
    return;
  }

  const blob = await put(GUEST_POSTS_BLOB_KEY, JSON.stringify(posts, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  guestPostsBlobUrlCache = blob.url;
}

async function ensureGuestPostsFile() {
  if (hasBlobStorage()) {
    await readGuestPostsFromBlob();
    return;
  }

  const guestPostsFilePath = resolveGuestPostsFilePath();

  try {
    await fs.access(guestPostsFilePath);
  } catch {
    await fs.mkdir(path.dirname(guestPostsFilePath), { recursive: true });
    await fs.writeFile(guestPostsFilePath, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readGuestPosts(): Promise<GuestPost[]> {
  if (hasBlobStorage()) {
    return readGuestPostsFromBlob();
  }

  await ensureGuestPostsFile();
  const raw = await fs.readFile(resolveGuestPostsFilePath(), "utf-8");
  return JSON.parse(raw) as GuestPost[];
}

async function writeGuestPosts(posts: GuestPost[]) {
  if (hasBlobStorage()) {
    await writeGuestPostsToBlob(posts);
    return;
  }

  await fs.writeFile(resolveGuestPostsFilePath(), JSON.stringify(posts, null, 2), "utf-8");
}

export async function getGuestPosts(): Promise<GuestPost[]> {
  return readGuestPosts();
}

export async function getGuestPostById(id: number): Promise<GuestPost | undefined> {
  const posts = await readGuestPosts();
  return posts.find((post) => post.id === id);
}

export async function addGuestPost(input: NewGuestPostInput): Promise<GuestPost> {
  const posts = await readGuestPosts();
  const nextPostId = posts.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1;
  const attachment = await saveAttachmentFile(input.attachmentFile);

  const post: GuestPost = {
    id: nextPostId,
    title: input.title,
    content: input.content,
    authorId: input.authorId,
    authorName: input.authorName,
    date: getKstDateString(),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    fileUrl: attachment?.fileUrl,
    fileName: attachment?.fileName,
  };

  posts.unshift(post);
  await writeGuestPosts(posts);
  return post;
}

export async function deleteGuestPostById(id: number): Promise<boolean> {
  const posts = await readGuestPosts();
  const targetPost = posts.find((post) => post.id === id);
  const filtered = posts.filter((post) => post.id !== id);

  if (filtered.length === posts.length) {
    return false;
  }

  await removeAttachment(targetPost?.fileUrl);
  await writeGuestPosts(filtered);
  return true;
}

export async function updateGuestPostById(
  id: number,
  input: { title: string; content: string },
): Promise<GuestPost | undefined> {
  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === id);

  if (index === -1) {
    return undefined;
  }

  const updatedPost: GuestPost = {
    ...posts[index],
    title: input.title,
    content: input.content,
  };

  posts[index] = updatedPost;
  await writeGuestPosts(posts);
  return updatedPost;
}
