import { GuestPostCategory, normalizeGuestPostCategory } from "@/lib/post-categories";
import {
  SUPABASE_URL,
  SUPABASE_GUEST_POSTS_TABLE,
  SUPABASE_GUEST_POST_COMMENTS_TABLE,
} from "@/lib/env";
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

type UpdateGuestPostInput = {
  title: string;
  content: string;
  category: GuestPostCategory;
  linkUrl?: string;
  attachmentFile?: File | null;
  removeAttachment?: boolean;
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
};

type SupabaseLegacyGuestPostRow = Omit<SupabaseGuestPostRow, "category"> & {
  category?: string | null;
};

type SupabaseGuestPostWithCommentsRow = SupabaseGuestPostRow & {
  comments?: GuestComment[] | null;
};

type SupabaseLegacyGuestPostWithCommentsRow = SupabaseLegacyGuestPostRow & {
  comments?: GuestComment[] | null;
};

type SupabaseGuestCommentRow = {
  id: number;
  guest_post_id: number;
  author_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
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

function getSupabaseGuestPostCommentsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_GUEST_POST_COMMENTS_TABLE}`;
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

async function requestSupabaseGuestComments<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabaseGuestPostCommentsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

function formatGuestCommentDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

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
    .format(date)
    .replace(",", "");
}

function mapSupabaseRowToGuestPost(
  row:
    | SupabaseGuestPostRow
    | SupabaseLegacyGuestPostRow
    | SupabaseGuestPostWithCommentsRow
    | SupabaseLegacyGuestPostWithCommentsRow,
): GuestPost {
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
    comments: "comments" in row && Array.isArray(row.comments) ? row.comments : [],
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
  };
}

function mapSupabaseRowToGuestComment(row: SupabaseGuestCommentRow): GuestComment {
  return {
    id: row.id,
    authorId: row.author_id ?? "",
    authorName: row.author_name,
    content: row.content,
    dateTime: formatGuestCommentDateTime(row.created_at),
  };
}

function mapGuestCommentToSupabaseRow(postId: number, comment: Omit<GuestComment, "id">) {
  return {
    guest_post_id: postId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    content: comment.content,
    created_at: new Date().toISOString(),
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

async function readGuestCommentsFromSupabase(postId?: number): Promise<Map<number, GuestComment[]> | null> {
  const postFilter = typeof postId === "number" ? `&guest_post_id=eq.${postId}` : "";
  const result = await requestSupabaseGuestComments<SupabaseGuestCommentRow[]>(
    "GET",
    `?select=id,guest_post_id,author_id,author_name,content,created_at${postFilter}&order=id.asc`,
  );

  const commentsByPostId = new Map<number, GuestComment[]>();
  if (!result.ok || !Array.isArray(result.data)) {
    return null;
  }

  for (const row of result.data) {
    const comments = commentsByPostId.get(row.guest_post_id) ?? [];
    comments.push(mapSupabaseRowToGuestComment(row));
    commentsByPostId.set(row.guest_post_id, comments);
  }

  return commentsByPostId;
}

async function readGuestPostsFromSupabase(): Promise<GuestPost[]> {
  const result = await requestSupabase<SupabaseGuestPostRow[]>(
    "GET",
    "?select=id,title,content,author_id,author_name,category,date,link_url,file_url,file_name&order=id.desc",
  );

  if (result.ok && Array.isArray(result.data)) {
    const commentsByPostId = await readGuestCommentsFromSupabase();
    if (!commentsByPostId) {
      const commentsResult = await requestSupabase<SupabaseGuestPostWithCommentsRow[]>(
        "GET",
        "?select=id,title,content,author_id,author_name,category,date,link_url,file_url,file_name,comments&order=id.desc",
      );

      if (commentsResult.ok && Array.isArray(commentsResult.data)) {
        return commentsResult.data.map(mapSupabaseRowToGuestPost);
      }
    }

    return result.data.map((row) => ({
      ...mapSupabaseRowToGuestPost(row),
      comments: commentsByPostId?.get(row.id) ?? [],
    }));
  }

  const legacyResult = await requestSupabase<SupabaseLegacyGuestPostRow[]>(
    "GET",
    "?select=id,title,content,author_id,author_name,date,link_url,file_url,file_name&order=id.desc",
  );

  if (!legacyResult.ok || !Array.isArray(legacyResult.data)) {
    const commentsResult = await requestSupabase<SupabaseGuestPostWithCommentsRow[]>(
      "GET",
      "?select=id,title,content,author_id,author_name,category,date,link_url,file_url,file_name,comments&order=id.desc",
    );

    if (!commentsResult.ok || !Array.isArray(commentsResult.data)) {
      return [];
    }

    return commentsResult.data.map(mapSupabaseRowToGuestPost);
  }

  const commentsByPostId = await readGuestCommentsFromSupabase();
  if (!commentsByPostId) {
    const legacyCommentsResult = await requestSupabase<SupabaseLegacyGuestPostWithCommentsRow[]>(
      "GET",
      "?select=id,title,content,author_id,author_name,date,link_url,file_url,file_name,comments&order=id.desc",
    );

    if (legacyCommentsResult.ok && Array.isArray(legacyCommentsResult.data)) {
      return legacyCommentsResult.data.map(mapSupabaseRowToGuestPost);
    }
  }

  return legacyResult.data.map((row) => ({
    ...mapSupabaseRowToGuestPost(row),
    comments: commentsByPostId?.get(row.id) ?? [],
  }));
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
  input: UpdateGuestPostInput,
): Promise<GuestPost | undefined> {
  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === id);

  if (index === -1) {
    return undefined;
  }

  const currentPost = posts[index];
  const attachment = await saveFile(input.attachmentFile);

  let nextFileUrl = currentPost.fileUrl;
  let nextFileName = currentPost.fileName;

  if (input.removeAttachment) {
    await deleteFile(currentPost.fileUrl);
    nextFileUrl = undefined;
    nextFileName = undefined;
  }

  if (attachment) {
    await deleteFile(currentPost.fileUrl);
    nextFileUrl = attachment.fileUrl;
    nextFileName = attachment.fileName;
  }

  const updatedPost: GuestPost = {
    ...currentPost,
    title: input.title,
    content: input.content,
    category: normalizeGuestPostCategory(input.category),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    fileUrl: nextFileUrl,
    fileName: nextFileName,
  };

  posts[index] = updatedPost;
  await writeGuestPosts(posts);
  return updatedPost;
}

export async function addGuestCommentById(
  postId: number,
  input: { authorId: string; authorName: string; content: string },
): Promise<GuestComment | undefined> {
  if (hasSupabaseStorage()) {
    const comment: Omit<GuestComment, "id"> = {
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content,
      dateTime: getKstDateTimeString(),
    };

    const result = await requestSupabaseGuestComments<SupabaseGuestCommentRow[]>(
      "POST",
      "",
      [mapGuestCommentToSupabaseRow(postId, comment)],
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToGuestComment(result.data[0]);
  }

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
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestComments<SupabaseGuestCommentRow[]>(
      "PATCH",
      `?guest_post_id=eq.${postId}&id=eq.${commentId}&select=id,guest_post_id,author_id,author_name,content,created_at`,
      { content },
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToGuestComment(result.data[0]);
  }

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
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestComments<SupabaseGuestCommentRow[]>(
      "DELETE",
      `?guest_post_id=eq.${postId}&id=eq.${commentId}&select=id,guest_post_id,author_id,author_name,content,created_at`,
      undefined,
      "return=representation",
    );

    return Boolean(result.ok && Array.isArray(result.data) && result.data.length > 0);
  }

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
