import { promises as fs } from "node:fs";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import { GuestPostCategory, normalizeGuestPostCategory } from "@/lib/post-categories";

export type GuestPost = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  category: GuestPostCategory;
  date: string;
  linkUrl?: string;
  fileUrl?: string;
  fileName?: string;
  comments?: GuestComment[];
};

export type GuestComment = {
  id: number;
  authorId: string;
  authorName: string;
  content: string;
  dateTime: string;
};

type NewGuestPostInput = {
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  category: GuestPostCategory;
  linkUrl?: string;
  attachmentFile?: File | null;
};

type SupabaseGuestPostRow = {
  id: number;
  title: string;
  content: string;
  author_id: string;
  author_name: string | null;
  category: string | null;
  date: string;
  link_url: string | null;
  file_url: string | null;
  file_name: string | null;
  comments: GuestComment[] | null;
};

type SupabaseLegacyGuestPostRow = Omit<SupabaseGuestPostRow, "category"> & {
  category?: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const GUEST_POSTS_FILE_LOCAL = path.join(DATA_DIR, "guest-posts.json");
const GUEST_POSTS_FILE_TMP = path.join("/tmp", "my-first-web-guest-posts.json");
const GUEST_POSTS_BLOB_KEY = "guest/guest-posts.json";
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_GUEST_POSTS_TABLE = process.env.SUPABASE_GUEST_POSTS_TABLE || "guest_posts";
const SUPABASE_UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";

let guestPostsBlobUrlCache: string | undefined;
let hasTriedSupabaseGuestBootstrap = false;

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

function hasSupabaseStorage() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseGuestPostsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_GUEST_POSTS_TABLE}`;
  return `${base}${query}`;
}

function getSupabaseStorageObjectEndpoint(pathname = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object`;
  return `${base}${pathname}`;
}

function getSupabasePublicFileUrl(storagePath: string) {
  if (!SUPABASE_URL) {
    return "";
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${SUPABASE_UPLOADS_BUCKET}/${storagePath}`;
}

async function requestSupabase<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 500, data: null };
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  if (prefer) {
    headers.Prefer = prefer;
  }

  const response = await fetch(getSupabaseGuestPostsEndpoint(query), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, status: response.status, data: null };
  }

  if (response.status === 204) {
    return { ok: true, status: response.status, data: null };
  }

  const data = (await response.json()) as T;
  return { ok: true, status: response.status, data };
}

function mapSupabaseRowToGuestPost(row: SupabaseGuestPostRow | SupabaseLegacyGuestPostRow): GuestPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    authorId: row.author_id,
    authorName: row.author_name ?? undefined,
    category: normalizeGuestPostCategory(row.category ?? undefined),
    date: row.date,
    linkUrl: row.link_url ?? undefined,
    fileUrl: row.file_url ?? undefined,
    fileName: row.file_name ?? undefined,
    comments: Array.isArray(row.comments) ? row.comments : [],
  };
}

function mapGuestPostToSupabaseRow(post: GuestPost) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author_id: post.authorId,
    author_name: post.authorName ?? null,
    category: post.category,
    date: post.date,
    link_url: post.linkUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
    comments: post.comments ?? [],
  };
}

function mapGuestPostToSupabaseLegacyRow(post: GuestPost) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author_id: post.authorId,
    author_name: post.authorName ?? null,
    date: post.date,
    link_url: post.linkUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
    comments: post.comments ?? [],
  };
}

function normalizeGuestPostRecord(
  post: Omit<GuestPost, "category"> & { category?: string },
): GuestPost {
  return {
    ...post,
    category: normalizeGuestPostCategory(post.category),
  };
}

async function readGuestPostsFromSupabase(): Promise<GuestPost[]> {
  const result = await requestSupabase<SupabaseGuestPostRow[]>(
    "GET",
    "?select=id,title,content,author_id,author_name,category,date,link_url,file_url,file_name,comments&order=id.desc",
  );

  if (result.ok && Array.isArray(result.data)) {
    return result.data.map(mapSupabaseRowToGuestPost);
  }

  const legacyResult = await requestSupabase<SupabaseLegacyGuestPostRow[]>(
    "GET",
    "?select=id,title,content,author_id,author_name,date,link_url,file_url,file_name,comments&order=id.desc",
  );

  if (!legacyResult.ok || !Array.isArray(legacyResult.data)) {
    return [];
  }

  return legacyResult.data.map(mapSupabaseRowToGuestPost);
}

async function syncGuestPostsToSupabase(posts: GuestPost[]) {
  const rows = posts.map(mapGuestPostToSupabaseRow);

  let didSync = false;
  if (rows.length > 0) {
    const result = await requestSupabase(
      "POST",
      "?on_conflict=id",
      rows,
      "resolution=merge-duplicates,return=minimal",
    );

    if (result.ok) {
      didSync = true;
    } else {
      const legacyResult = await requestSupabase(
        "POST",
        "?on_conflict=id",
        posts.map(mapGuestPostToSupabaseLegacyRow),
        "resolution=merge-duplicates,return=minimal",
      );
      didSync = legacyResult.ok;
    }
  }

  if (rows.length === 0) {
    await requestSupabase("DELETE", "?id=gt.0");
    return;
  }

  if (!didSync) {
    throw new Error("Failed to sync guest posts to Supabase.");
  }

  const keepIds = rows.map((row) => row.id).join(",");
  await requestSupabase("DELETE", `?id=not.in.(${keepIds})`);
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

function getKstDateTimeString() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(",", "");
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadAttachmentToSupabaseStorage(file: File, uniqueName: string) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return undefined;
  }

  const storagePath = `uploads/${uniqueName}`;
  const response = await fetch(
    getSupabaseStorageObjectEndpoint(`/${SUPABASE_UPLOADS_BUCKET}/${storagePath}`),
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
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
    fileUrl: getSupabasePublicFileUrl(storagePath),
    fileName: file.name || uniqueName,
  };
}

function extractSupabaseStoragePath(fileUrl?: string) {
  if (!fileUrl) {
    return undefined;
  }

  const publicPrefix = `/storage/v1/object/public/${SUPABASE_UPLOADS_BUCKET}/`;
  const privatePrefix = `/storage/v1/object/${SUPABASE_UPLOADS_BUCKET}/`;

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

async function removeSupabaseAttachment(fileUrl?: string) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const storagePath = extractSupabaseStoragePath(fileUrl);
  if (!storagePath) {
    return;
  }

  try {
    await fetch(getSupabaseStorageObjectEndpoint(`/${SUPABASE_UPLOADS_BUCKET}/${storagePath}`), {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: "no-store",
    });
  } catch {
    // no-op
  }
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

  if (hasSupabaseStorage()) {
    const uploaded = await uploadAttachmentToSupabaseStorage(file, uniqueName);
    if (uploaded) {
      return uploaded;
    }
  }

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

  if (hasSupabaseStorage()) {
    await removeSupabaseAttachment(fileUrl);
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

  const data = (await response.json()) as Array<Omit<GuestPost, "category"> & { category?: string }>;
  return Array.isArray(data) ? data.map(normalizeGuestPostRecord) : [];
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

async function readGuestPostsFromLegacyStorage(): Promise<GuestPost[]> {
  if (hasBlobStorage()) {
    return readGuestPostsFromBlob();
  }

  await ensureGuestPostsFile();
  const raw = await fs.readFile(resolveGuestPostsFilePath(), "utf-8");
  return (JSON.parse(raw) as Array<Omit<GuestPost, "category"> & { category?: string }>).map(
    normalizeGuestPostRecord,
  );
}

async function writeGuestPostsToLegacyStorage(posts: GuestPost[]) {
  if (hasBlobStorage()) {
    await writeGuestPostsToBlob(posts);
    return;
  }

  await fs.writeFile(resolveGuestPostsFilePath(), JSON.stringify(posts, null, 2), "utf-8");
}

async function readGuestPosts(): Promise<GuestPost[]> {
  if (!hasSupabaseStorage()) {
    return readGuestPostsFromLegacyStorage();
  }

  const supabasePosts = await readGuestPostsFromSupabase();
  if (supabasePosts.length > 0 || hasTriedSupabaseGuestBootstrap) {
    return supabasePosts;
  }

  hasTriedSupabaseGuestBootstrap = true;
  const legacyPosts = await readGuestPostsFromLegacyStorage();
  if (legacyPosts.length === 0) {
    return [];
  }

  await syncGuestPostsToSupabase(legacyPosts);
  return readGuestPostsFromSupabase();
}

async function writeGuestPosts(posts: GuestPost[]) {
  if (hasSupabaseStorage()) {
    await syncGuestPostsToSupabase(posts);
    return;
  }

  await writeGuestPostsToLegacyStorage(posts);
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
    category: normalizeGuestPostCategory(input.category),
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
  input: { title: string; content: string; category: GuestPostCategory },
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
    category: normalizeGuestPostCategory(input.category),
  };

  posts[index] = updatedPost;
  await writeGuestPosts(posts);
  return updatedPost;
}

export async function addGuestCommentById(
  postId: number,
  input: { authorId: string; authorName: string; content: string },
): Promise<GuestComment | undefined> {
  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === postId);

  if (index === -1) {
    return undefined;
  }

  const currentPost = posts[index];
  const currentComments = currentPost.comments ?? [];
  const nextCommentId = currentComments.reduce((maxId, comment) => Math.max(maxId, comment.id), 0) + 1;

  const comment: GuestComment = {
    id: nextCommentId,
    authorId: input.authorId,
    authorName: input.authorName,
    content: input.content,
    dateTime: getKstDateTimeString(),
  };

  posts[index] = {
    ...currentPost,
    comments: [...currentComments, comment],
  };

  await writeGuestPosts(posts);
  return comment;
}

export async function updateGuestCommentById(
  postId: number,
  commentId: number,
  content: string,
): Promise<GuestComment | undefined> {
  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === postId);

  if (index === -1) {
    return undefined;
  }

  const currentPost = posts[index];
  const currentComments = currentPost.comments ?? [];
  const commentIndex = currentComments.findIndex((comment) => comment.id === commentId);

  if (commentIndex === -1) {
    return undefined;
  }

  const updatedComment: GuestComment = {
    ...currentComments[commentIndex],
    content,
  };

  const nextComments = [...currentComments];
  nextComments[commentIndex] = updatedComment;

  posts[index] = {
    ...currentPost,
    comments: nextComments,
  };

  await writeGuestPosts(posts);
  return updatedComment;
}

export async function deleteGuestCommentById(postId: number, commentId: number): Promise<boolean> {
  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === postId);

  if (index === -1) {
    return false;
  }

  const currentPost = posts[index];
  const currentComments = currentPost.comments ?? [];
  const filteredComments = currentComments.filter((comment) => comment.id !== commentId);

  if (filteredComments.length === currentComments.length) {
    return false;
  }

  posts[index] = {
    ...currentPost,
    comments: filteredComments,
  };

  await writeGuestPosts(posts);
  return true;
}
