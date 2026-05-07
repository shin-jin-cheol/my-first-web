import { GuestPostCategory, normalizeGuestPostCategory } from "@/lib/post-categories";
import { SUPABASE_URL, SUPABASE_GUEST_POSTS_TABLE } from "@/lib/env";
import { getKstDateString, getKstDateTimeString } from "@/lib/date";
import { requestSupabaseHttp } from "@/lib/supabase/http";
import { normalizeLinkUrl } from "@/lib/attachment-utils";
import { deleteFile, hasSupabaseStorage, readJsonStorage, saveFile, writeJsonStorage } from "@/lib/storage";

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

const GUEST_POSTS_BLOB_KEY = "guest/guest-posts.json";
// SUPABASE_* constants are centralized in lib/env.ts
const CATEGORY_SCHEMA_MESSAGE =
  "선택한 카테고리를 저장하려면 Supabase SQL Editor에서 docs/supabase-content.sql을 먼저 실행해야 합니다.";

let hasTriedSupabaseGuestBootstrap = false;

function getSupabaseGuestPostsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_GUEST_POSTS_TABLE}`;
  return `${base}${query}`;
}

async function requestSupabase<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  // Use common HTTP wrapper with parseMode=text for safeJsonParse
  return requestSupabaseHttp<T>(getSupabaseGuestPostsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
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
      const hasNonStudyCategory = posts.some((post) => post.category !== "study");
      if (hasNonStudyCategory) {
        throw new Error(CATEGORY_SCHEMA_MESSAGE);
      }

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

async function readGuestPostsFromLegacyStorage(): Promise<GuestPost[]> {
  return readJsonStorage({
    blobKey: GUEST_POSTS_BLOB_KEY,
    localFileName: "guest-posts.json",
    tmpFileName: "my-first-web-guest-posts.json",
    seedData: [] as Array<Omit<GuestPost, "category"> & { category?: string }>,
    normalize: (posts) => (Array.isArray(posts) ? posts.map(normalizeGuestPostRecord) : []),
    useBlob: true,
  });
}

async function writeGuestPostsToLegacyStorage(posts: GuestPost[]) {
  await writeJsonStorage(posts, {
    blobKey: GUEST_POSTS_BLOB_KEY,
    localFileName: "guest-posts.json",
    tmpFileName: "my-first-web-guest-posts.json",
    seedData: [] as GuestPost[],
    useBlob: true,
  });
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
  const attachment = await saveFile(input.attachmentFile);

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

  await deleteFile(targetPost?.fileUrl);
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
