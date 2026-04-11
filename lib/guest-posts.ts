import { promises as fs } from "node:fs";
import path from "node:path";
import { list, put } from "@vercel/blob";

export type GuestPost = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  date: string;
};

type NewGuestPostInput = {
  title: string;
  content: string;
  authorId: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const GUEST_POSTS_FILE_LOCAL = path.join(DATA_DIR, "guest-posts.json");
const GUEST_POSTS_FILE_TMP = path.join("/tmp", "my-first-web-guest-posts.json");
const GUEST_POSTS_BLOB_KEY = "guest/guest-posts.json";

let guestPostsBlobUrlCache: string | undefined;

function pickLatestBlobUrl(blobs: Array<{ url: string; uploadedAt?: string | Date }>): string | undefined {
  if (blobs.length === 0) {
    return undefined;
  }

  const sorted = [...blobs].sort((a, b) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return bTime - aTime;
  });

  return sorted[0]?.url;
}

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function resolveGuestPostsFilePath() {
  // Vercel deployment filesystem is read-only except /tmp.
  if (process.env.VERCEL) {
    return GUEST_POSTS_FILE_TMP;
  }
  return GUEST_POSTS_FILE_LOCAL;
}

async function readGuestPostsFromBlob(): Promise<GuestPost[]> {
  if (!hasBlobStorage()) {
    return [];
  }

  if (!guestPostsBlobUrlCache) {
    const existing = await list({ prefix: GUEST_POSTS_BLOB_KEY, limit: 100 });
    guestPostsBlobUrlCache = pickLatestBlobUrl(existing.blobs);

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
  }

  if (!guestPostsBlobUrlCache) {
    return [];
  }

  const response = await fetch(guestPostsBlobUrlCache, { cache: "no-store" });
  if (!response.ok) {
    return [];
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

export async function addGuestPost(input: NewGuestPostInput): Promise<GuestPost> {
  const posts = await readGuestPosts();
  const nextPostId = posts.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1;

  const post: GuestPost = {
    id: nextPostId,
    title: input.title,
    content: input.content,
    authorId: input.authorId,
    date: new Date().toISOString().slice(0, 10),
  };

  posts.unshift(post);
  await writeGuestPosts(posts);
  return post;
}

export async function deleteGuestPostById(id: number): Promise<boolean> {
  const posts = await readGuestPosts();
  const filtered = posts.filter((post) => post.id !== id);

  if (filtered.length === posts.length) {
    return false;
  }

  await writeGuestPosts(filtered);
  return true;
}
