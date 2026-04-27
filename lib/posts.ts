import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { BlogPostCategory, normalizeBlogPostCategory } from "@/lib/post-categories";

export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  category: BlogPostCategory;
  date: string;
  linkUrl?: string;
  fileUrl?: string;
  fileName?: string;
};

export type PostComment = {
  id: number;
  postId: number;
  authorId: string;
  authorName: string;
  content: string;
  dateTime: string;
};

type NewPostInput = {
  title: string;
  content: string;
  author: string;
  authorId?: string;
  category: BlogPostCategory;
  linkUrl?: string;
  attachmentFile?: File | null;
};

type UpdatePostInput = {
  title: string;
  content: string;
  author: string;
  category: BlogPostCategory;
  linkUrl?: string;
  attachmentFile?: File | null;
  removeAttachment?: boolean;
};

type SupabasePostRow = {
  id: number;
  title: string;
  content: string;
  author: string;
  author_id: string | null;
  category: string | null;
  date: string;
  link_url: string | null;
  file_url: string | null;
  file_name: string | null;
};

type SupabaseLegacyPostRow = Omit<SupabasePostRow, "category"> & {
  category?: string | null;
};

type SupabasePostCommentRow = {
  id: number;
  post_id: number;
  author_id: string;
  author_name: string;
  content: string;
  date_time: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE_LOCAL = path.join(DATA_DIR, "posts.json");
const POSTS_FILE_TMP = path.join("/tmp", "my-first-web-posts.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_POSTS_TABLE = process.env.SUPABASE_POSTS_TABLE || "posts";
const SUPABASE_POST_COMMENTS_TABLE = process.env.SUPABASE_POST_COMMENTS_TABLE || "post_comments";
const SUPABASE_UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Next.js 16 App Router 시작하기",
    content:
      "Next.js 16에서 App Router를 사용하는 방법과 기본 구조에 대해 알아봅니다. 새로운 파일 기반 라우팅 시스템과 Server Component의 장점을 살펴봅시다.",
    author: "신진철",
    category: "study",
    date: "2026-04-05",
  },
  {
    id: 2,
    title: "Tailwind CSS 4로 스타일링하기",
    content:
      "Tailwind CSS 4의 새로운 기능들을 소개합니다. @import 문법과 더욱 강력해진 유틸리티 클래스를 활용하여 빠르고 효율적인 스타일링을 경험해보세요.",
    author: "신진철",
    category: "study",
    date: "2026-04-03",
  },
  {
    id: 3,
    title: "TypeScript 타입 안전성 높이기",
    content:
      "TypeScript를 사용하면서 타입 안전성을 최대한 활용하는 팁들을 공유합니다. 제네릭, 유틸리티 타입, 타입 가드 등을 통해 더욱 견고한 코드를 작성할 수 있습니다.",
    author: "신진철",
    category: "study",
    date: "2026-03-31",
  },
];

let hasTriedSupabasePostsBootstrap = false;

function hasSupabaseStorage() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabasePostsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_POSTS_TABLE}`;
  return `${base}${query}`;
}

function getSupabasePostCommentsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_POST_COMMENTS_TABLE}`;
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

  const response = await fetch(getSupabasePostsEndpoint(query), {
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

async function requestSupabasePostComments<T>(
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

  const response = await fetch(getSupabasePostCommentsEndpoint(query), {
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

function mapSupabaseRowToPost(row: SupabasePostRow | SupabaseLegacyPostRow): Post {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    authorId: row.author_id ?? undefined,
    category: normalizeBlogPostCategory(row.category ?? undefined),
    date: row.date,
    linkUrl: row.link_url ?? undefined,
    fileUrl: row.file_url ?? undefined,
    fileName: row.file_name ?? undefined,
  };
}

function mapPostToSupabaseRow(post: Post) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    author_id: post.authorId ?? null,
    category: post.category,
    date: post.date,
    link_url: post.linkUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
  };
}

function mapPostToSupabaseLegacyRow(post: Post) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    author_id: post.authorId ?? null,
    date: post.date,
    link_url: post.linkUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
  };
}

function normalizePostRecord(post: Omit<Post, "category"> & { category?: string }): Post {
  return {
    ...post,
    category: normalizeBlogPostCategory(post.category),
  };
}

async function readPostsFromSupabase(): Promise<Post[]> {
  const result = await requestSupabase<SupabasePostRow[]>(
    "GET",
    "?select=id,title,content,author,author_id,category,date,link_url,file_url,file_name&order=id.desc",
  );

  if (result.ok && Array.isArray(result.data)) {
    return result.data.map(mapSupabaseRowToPost);
  }

  const legacyResult = await requestSupabase<SupabaseLegacyPostRow[]>(
    "GET",
    "?select=id,title,content,author,author_id,date,link_url,file_url,file_name&order=id.desc",
  );

  if (!legacyResult.ok || !Array.isArray(legacyResult.data)) {
    return [];
  }

  return legacyResult.data.map(mapSupabaseRowToPost);
}

async function upsertPostsToSupabase(posts: Post[]) {
  const rows = posts.map(mapPostToSupabaseRow);
  const result = await requestSupabase(
    "POST",
    "?on_conflict=id",
    rows,
    "resolution=merge-duplicates,return=minimal",
  );

  if (!result.ok) {
    await requestSupabase(
      "POST",
      "?on_conflict=id",
      posts.map(mapPostToSupabaseLegacyRow),
      "resolution=merge-duplicates,return=minimal",
    );
  }
}

async function getNextSupabasePostId() {
  const result = await requestSupabase<SupabasePostRow[]>("GET", "?select=id&order=id.desc&limit=1");
  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return 1;
  }

  return result.data[0].id + 1;
}

async function ensurePostsFile() {
  const postsFilePath = resolvePostsFilePath();

  try {
    await fs.access(postsFilePath);
  } catch {
    await fs.mkdir(path.dirname(postsFilePath), { recursive: true });
    await fs.writeFile(postsFilePath, JSON.stringify(initialPosts, null, 2), "utf-8");
  }
}

function resolvePostsFilePath() {
  // Vercel deployment filesystem is read-only except /tmp.
  if (process.env.VERCEL) {
    return POSTS_FILE_TMP;
  }
  return POSTS_FILE_LOCAL;
}

async function readPostsFromLegacyStorage(): Promise<Post[]> {
  await ensurePostsFile();
  const raw = await fs.readFile(resolvePostsFilePath(), "utf-8");
  return (JSON.parse(raw) as Array<Omit<Post, "category"> & { category?: string }>).map(
    normalizePostRecord,
  );
}

async function writePostsToLegacyStorage(posts: Post[]) {
  await fs.writeFile(resolvePostsFilePath(), JSON.stringify(posts, null, 2), "utf-8");
}

async function readPosts(): Promise<Post[]> {
  if (!hasSupabaseStorage()) {
    return readPostsFromLegacyStorage();
  }

  const supabasePosts = await readPostsFromSupabase();
  if (supabasePosts.length > 0 || hasTriedSupabasePostsBootstrap) {
    return supabasePosts;
  }

  hasTriedSupabasePostsBootstrap = true;
  const legacyPosts = await readPostsFromLegacyStorage();
  if (legacyPosts.length === 0) {
    return [];
  }

  await upsertPostsToSupabase(legacyPosts);
  return readPostsFromSupabase();
}

async function writePosts(posts: Post[]) {
  if (hasSupabaseStorage()) {
    await upsertPostsToSupabase(posts);
    return;
  }

  await writePostsToLegacyStorage(posts);
}

function sanitizeFileName(fileName: string): string {
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
    // no-op when deletion fails or file already removed
  }
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

  // In production (or when token is configured), upload to Vercel Blob for persistent storage.
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
    // no-op when file does not exist
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
      // no-op when deletion fails or file already removed
    }
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

function getKstDateString() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function mapSupabaseRowToPostComment(row: SupabasePostCommentRow): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.author_name,
    content: row.content,
    dateTime: row.date_time,
  };
}

function mapPostCommentToSupabaseRow(comment: PostComment) {
  return {
    id: comment.id,
    post_id: comment.postId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    content: comment.content,
    date_time: comment.dateTime,
  };
}

export async function getPostCommentsByPostId(postId: number): Promise<PostComment[]> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostComments<SupabasePostCommentRow[]>(
      "GET",
      `?select=id,post_id,author_id,author_name,content,date_time&post_id=eq.${postId}&order=id.asc`,
    );

    if (!result.ok || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.map(mapSupabaseRowToPostComment);
  }

  const posts = await readPosts();
  const post = posts.find((item) => item.id === postId) as (Post & { comments?: PostComment[] }) | undefined;
  return post?.comments ?? [];
}

export async function addPostCommentByPostId(
  postId: number,
  input: { authorId: string; authorName: string; content: string },
): Promise<PostComment | undefined> {
  if (hasSupabaseStorage()) {
    const nextIdResult = await requestSupabasePostComments<SupabasePostCommentRow[]>(
      "GET",
      `?select=id&post_id=eq.${postId}&order=id.desc&limit=1`,
    );

    const nextCommentId =
      !nextIdResult.ok || !Array.isArray(nextIdResult.data) || nextIdResult.data.length === 0
        ? 1
        : nextIdResult.data[0].id + 1;

    const comment: PostComment = {
      id: nextCommentId,
      postId,
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content,
      dateTime: getKstDateTimeString(),
    };

    const result = await requestSupabasePostComments<SupabasePostCommentRow[]>(
      "POST",
      "",
      [mapPostCommentToSupabaseRow(comment)],
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToPostComment(result.data[0]);
  }

  const posts = await readPosts();
  const index = posts.findIndex((item) => item.id === postId);
  if (index === -1) {
    return undefined;
  }

  const currentPost = posts[index] as Post & { comments?: PostComment[] };
  const currentComments = currentPost.comments ?? [];
  const nextCommentId = currentComments.reduce((maxId, comment) => Math.max(maxId, comment.id), 0) + 1;
  const comment: PostComment = {
    id: nextCommentId,
    postId,
    authorId: input.authorId,
    authorName: input.authorName,
    content: input.content,
    dateTime: getKstDateTimeString(),
  };

  posts[index] = {
    ...posts[index],
    comments: [...currentComments, comment],
  } as Post;

  await writePosts(posts);
  return comment;
}

export async function updatePostCommentById(
  postId: number,
  commentId: number,
  content: string,
): Promise<PostComment | undefined> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostComments<SupabasePostCommentRow[]>(
      "PATCH",
      `?post_id=eq.${postId}&id=eq.${commentId}&select=id,post_id,author_id,author_name,content,date_time`,
      { content },
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToPostComment(result.data[0]);
  }

  const posts = await readPosts();
  const postIndex = posts.findIndex((item) => item.id === postId);
  if (postIndex === -1) {
    return undefined;
  }

  const currentPost = posts[postIndex] as Post & { comments?: PostComment[] };
  const currentComments = currentPost.comments ?? [];
  const commentIndex = currentComments.findIndex((comment) => comment.id === commentId);
  if (commentIndex === -1) {
    return undefined;
  }

  const updatedComment: PostComment = {
    ...currentComments[commentIndex],
    content,
  };

  const nextComments = [...currentComments];
  nextComments[commentIndex] = updatedComment;

  posts[postIndex] = {
    ...posts[postIndex],
    comments: nextComments,
  } as Post;

  await writePosts(posts);
  return updatedComment;
}

export async function deletePostCommentById(postId: number, commentId: number): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostComments<SupabasePostCommentRow[]>(
      "DELETE",
      `?post_id=eq.${postId}&id=eq.${commentId}&select=id,post_id,author_id,author_name,content,date_time`,
      undefined,
      "return=representation",
    );

    return Boolean(result.ok && Array.isArray(result.data) && result.data.length > 0);
  }

  const posts = await readPosts();
  const postIndex = posts.findIndex((item) => item.id === postId);
  if (postIndex === -1) {
    return false;
  }

  const currentPost = posts[postIndex] as Post & { comments?: PostComment[] };
  const currentComments = currentPost.comments ?? [];
  const filteredComments = currentComments.filter((comment) => comment.id !== commentId);
  if (filteredComments.length === currentComments.length) {
    return false;
  }

  posts[postIndex] = {
    ...posts[postIndex],
    comments: filteredComments,
  } as Post;

  await writePosts(posts);
  return true;
}

export async function getPosts(): Promise<Post[]> {
  return readPosts();
}

export async function getPostById(id: number): Promise<Post | undefined> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabase<SupabasePostRow[]>(
      "GET",
      `?select=id,title,content,author,author_id,category,date,link_url,file_url,file_name&id=eq.${id}&limit=1`,
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToPost(result.data[0]);
    }

    const legacyResult = await requestSupabase<SupabaseLegacyPostRow[]>(
      "GET",
      `?select=id,title,content,author,author_id,date,link_url,file_url,file_name&id=eq.${id}&limit=1`,
    );

    if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToPost(legacyResult.data[0]);
  }

  const posts = await readPosts();
  return posts.find((post) => post.id === id);
}

export async function addPost(input: NewPostInput): Promise<Post> {
  const attachment = await saveAttachmentFile(input.attachmentFile);

  const nextPostId = hasSupabaseStorage()
    ? await getNextSupabasePostId()
    : (await readPosts()).reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1;

  const post: Post = {
    id: nextPostId,
    title: input.title,
    content: input.content,
    author: input.author,
    authorId: input.authorId,
    category: normalizeBlogPostCategory(input.category),
    date: getKstDateString(),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    fileUrl: attachment?.fileUrl,
    fileName: attachment?.fileName,
  };

  if (hasSupabaseStorage()) {
    const result = await requestSupabase<SupabasePostRow[]>(
      "POST",
      "",
      [mapPostToSupabaseRow(post)],
      "return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToPost(result.data[0]);
    }

    const legacyResult = await requestSupabase<SupabaseLegacyPostRow[]>(
      "POST",
      "",
      [mapPostToSupabaseLegacyRow(post)],
      "return=representation",
    );

    if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
      throw new Error("Failed to create post in Supabase.");
    }

    return mapSupabaseRowToPost(legacyResult.data[0]);
  }

  const posts = await readPosts();
  posts.unshift(post);
  await writePosts(posts);
  return post;
}

export async function deletePostById(id: number): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const targetPost = await getPostById(id);
    const result = await requestSupabase<SupabasePostRow[]>(
      "DELETE",
      `?id=eq.${id}&select=id,title,content,author,author_id,category,date,link_url,file_url,file_name`,
      undefined,
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      const legacyResult = await requestSupabase<SupabaseLegacyPostRow[]>(
        "DELETE",
        `?id=eq.${id}&select=id,title,content,author,author_id,date,link_url,file_url,file_name`,
        undefined,
        "return=representation",
      );

      if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
        return false;
      }

      await removeAttachment(targetPost?.fileUrl);
      return true;
    }

    await removeAttachment(targetPost?.fileUrl);
    return true;
  }

  const posts = await readPosts();
  const targetPost = posts.find((post) => post.id === id);
  const filtered = posts.filter((post) => post.id !== id);

  if (filtered.length === posts.length) {
    return false;
  }

  await removeAttachment(targetPost?.fileUrl);

  await writePosts(filtered);
  return true;
}

export async function updatePostById(id: number, input: UpdatePostInput): Promise<Post | undefined> {
  const currentPost = await getPostById(id);
  if (!currentPost) {
    return undefined;
  }

  const attachment = await saveAttachmentFile(input.attachmentFile);

  let nextFileUrl = currentPost.fileUrl;
  let nextFileName = currentPost.fileName;

  if (input.removeAttachment) {
    await removeAttachment(currentPost.fileUrl);
    nextFileUrl = undefined;
    nextFileName = undefined;
  }

  if (attachment) {
    await removeAttachment(currentPost.fileUrl);
    nextFileUrl = attachment.fileUrl;
    nextFileName = attachment.fileName;
  }

  const updatedPost: Post = {
    ...currentPost,
    title: input.title,
    content: input.content,
    author: input.author,
    category: normalizeBlogPostCategory(input.category),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    fileUrl: nextFileUrl,
    fileName: nextFileName,
  };

  if (hasSupabaseStorage()) {
    const result = await requestSupabase<SupabasePostRow[]>(
      "PATCH",
      `?id=eq.${id}&select=id,title,content,author,author_id,category,date,link_url,file_url,file_name`,
      mapPostToSupabaseRow(updatedPost),
      "return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToPost(result.data[0]);
    }

    const legacyResult = await requestSupabase<SupabaseLegacyPostRow[]>(
      "PATCH",
      `?id=eq.${id}&select=id,title,content,author,author_id,date,link_url,file_url,file_name`,
      mapPostToSupabaseLegacyRow(updatedPost),
      "return=representation",
    );

    if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToPost(legacyResult.data[0]);
  }

  const posts = await readPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) {
    return undefined;
  }

  posts[index] = updatedPost;
  await writePosts(posts);
  return updatedPost;
}
