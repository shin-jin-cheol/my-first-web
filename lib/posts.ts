import { BlogPostCategory, normalizeBlogPostCategory } from "@/lib/post-categories";
import {
  SUPABASE_URL,
  SUPABASE_POSTS_TABLE,
  SUPABASE_POST_COMMENTS_TABLE,
} from "@/lib/env";
import { getKstDateString, getKstDateTimeString } from "@/lib/date";
import { requestSupabaseHttp } from "@/lib/supabase/http";
import { normalizeLinkUrl } from "@/lib/attachment-utils";
import { deleteFile, hasSupabaseStorage, readJsonStorage, saveFile, writeJsonStorage } from "@/lib/storage";

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
  views: number;
};

export type PostComment = {
  id: number;
  postId: number;
  authorId: string;
  authorName: string;
  content: string;
  dateTime: string;
  parentId?: number;
};

export type PostReaction = {
  id: number;
  postId: number;
  memberId: string;
  emoji: string;
  createdAt: string;
};

export type PostCommentReaction = {
  id: number;
  commentId: number;
  memberId: string;
  emoji: string;
  createdAt: string;
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
  views: number | null;
};

type SupabaseLegacyPostRow = Omit<SupabasePostRow, "category" | "views"> & {
  category?: string | null;
  views?: number | null;
};

type SupabasePostCommentRow = {
  id: number;
  post_id: number;
  author_id: string;
  author_name: string;
  content: string;
  date_time: string;
  parent_id?: number | null;
};

type SupabasePostReactionRow = {
  id: number;
  post_id: number;
  member_id: string;
  emoji: string;
  created_at: string;
};

type SupabasePostCommentReactionRow = {
  id: number;
  comment_id: number;
  member_id: string;
  emoji: string;
  created_at: string;
};

// SUPABASE_* constants are centralized in lib/env.ts
const CATEGORY_SCHEMA_MESSAGE =
  "선택한 카테고리를 저장하려면 Supabase SQL Editor에서 docs/supabase-content.sql을 먼저 실행해야 합니다.";

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Next.js 16 App Router 시작하기",
    content:
      "Next.js 16에서 App Router를 사용하는 방법과 기본 구조에 대해 알아봅니다. 새로운 파일 기반 라우팅 시스템과 Server Component의 장점을 살펴봅시다.",
    author: "신진철",
    category: "study",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: 2,
    title: "Tailwind CSS 4로 스타일링하기",
    content:
      "Tailwind CSS 4의 새로운 기능들을 소개합니다. @import 문법과 더욱 강력해진 유틸리티 클래스를 활용하여 빠르고 효율적인 스타일링을 경험해보세요.",
    author: "신진철",
    category: "study",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: 3,
    title: "TypeScript 타입 안전성 높이기",
    content:
      "TypeScript를 사용하면서 타입 안전성을 최대한 활용하는 팁들을 공유합니다. 제네릭, 유틸리티 타입, 타입 가드 등을 통해 더욱 견고한 코드를 작성할 수 있습니다.",
    author: "신진철",
    category: "study",
    date: "2026-03-31",
    views: 0,
  },
];

let hasTriedSupabasePostsBootstrap = false;

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

async function requestSupabase<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  // Use common HTTP wrapper with parseMode=text for safeJsonParse
  return requestSupabaseHttp<T>(getSupabasePostsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

async function requestSupabasePostComments<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  // Use common HTTP wrapper with parseMode=text for safeJsonParse
  return requestSupabaseHttp<T>(getSupabasePostCommentsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
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
    views: row.views ?? 0,
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
    views: post.views,
  };
}

function mapPostToSupabaseInsertRow(post: Omit<Post, "id">) {
  return {
    title: post.title,
    content: post.content,
    author: post.author,
    author_id: post.authorId ?? null,
    category: post.category,
    date: post.date,
    link_url: post.linkUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
    views: post.views,
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

function mapPostToSupabaseLegacyInsertRow(post: Omit<Post, "id">) {
  return {
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

function normalizePostRecord(
  post: Omit<Post, "category" | "views"> & { category?: string; views?: number },
): Post {
  return {
    ...post,
    category: normalizeBlogPostCategory(post.category),
    views: post.views ?? 0,
  };
}

async function readPostsFromSupabase(): Promise<Post[]> {
  const result = await requestSupabase<SupabasePostRow[]>(
    "GET",
    "?select=id,title,content,author,author_id,category,date,link_url,file_url,file_name,views&order=id.desc",
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

async function readPostsFromLegacyStorage(): Promise<Post[]> {
  return readJsonStorage({
    localFileName: "posts.json",
    tmpFileName: "my-first-web-posts.json",
    seedData: initialPosts,
    normalize: (posts: Array<Omit<Post, "category" | "views"> & { category?: string; views?: number }>) =>
      (posts ?? []).map(normalizePostRecord),
  });
}

async function writePostsToLegacyStorage(posts: Post[]) {
  await writeJsonStorage(posts, {
    localFileName: "posts.json",
    tmpFileName: "my-first-web-posts.json",
    seedData: initialPosts,
  });
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

// date formatting is centralized in lib/date.ts

function mapSupabaseRowToPostComment(row: SupabasePostCommentRow): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.author_name,
    content: row.content,
    dateTime: row.date_time,
    parentId: row.parent_id ?? undefined,
  };
}

function mapPostCommentToSupabaseRow(comment: Omit<PostComment, "id">) {
  return {
    post_id: comment.postId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    content: comment.content,
    date_time: comment.dateTime,
    parent_id: comment.parentId ?? null,
  };
}

function mapSupabaseRowToPostReaction(row: SupabasePostReactionRow): PostReaction {
  return {
    id: row.id,
    postId: row.post_id,
    memberId: row.member_id,
    emoji: row.emoji,
    createdAt: row.created_at,
  };
}

function mapSupabaseRowToPostCommentReaction(
  row: SupabasePostCommentReactionRow,
): PostCommentReaction {
  return {
    id: row.id,
    commentId: row.comment_id,
    memberId: row.member_id,
    emoji: row.emoji,
    createdAt: row.created_at,
  };
}

export async function getPostCommentsByPostId(postId: number): Promise<PostComment[]> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostComments<SupabasePostCommentRow[]>(
      "GET",
      `?select=id,post_id,author_id,author_name,content,date_time,parent_id&post_id=eq.${postId}&order=id.asc`,
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
  input: { authorId: string; authorName: string; content: string; parentId?: number },
): Promise<PostComment | undefined> {
  if (hasSupabaseStorage()) {
    const comment: Omit<PostComment, "id"> = {
      postId,
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content,
      dateTime: getKstDateTimeString(),
      parentId: input.parentId,
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
    parentId: input.parentId,
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
      `?post_id=eq.${postId}&id=eq.${commentId}&select=id,post_id,author_id,author_name,content,date_time,parent_id`,
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
      `?select=id,title,content,author,author_id,category,date,link_url,file_url,file_name,views&id=eq.${id}&limit=1`,
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

export async function incrementPostViews(postId: number): Promise<void> {
  if (!Number.isFinite(postId) || postId <= 0) {
    return;
  }

  if (hasSupabaseStorage()) {
    const currentPost = await getPostById(postId);
    if (!currentPost) {
      return;
    }

    await requestSupabase(
      "PATCH",
      `?id=eq.${postId}`,
      { views: currentPost.views + 1 },
      "return=minimal",
    );
    return;
  }

  const posts = await readPosts();
  const index = posts.findIndex((post) => post.id === postId);
  if (index === -1) {
    return;
  }

  posts[index] = {
    ...posts[index],
    views: posts[index].views + 1,
  };
  await writePosts(posts);
}

export async function addPost(input: NewPostInput): Promise<Post> {
  const attachment = await saveFile(input.attachmentFile);

  const postInput: Omit<Post, "id"> = {
    title: input.title,
    content: input.content,
    author: input.author,
    authorId: input.authorId,
    category: normalizeBlogPostCategory(input.category),
    date: getKstDateString(),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    fileUrl: attachment?.fileUrl,
    fileName: attachment?.fileName,
    views: 0,
  };

  if (hasSupabaseStorage()) {
    const result = await requestSupabase<SupabasePostRow[]>(
      "POST",
      "",
      [mapPostToSupabaseInsertRow(postInput)],
      "return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToPost(result.data[0]);
    }

    if (postInput.category !== "study") {
      throw new Error(CATEGORY_SCHEMA_MESSAGE);
    }

    const legacyResult = await requestSupabase<SupabaseLegacyPostRow[]>(
      "POST",
      "",
      [mapPostToSupabaseLegacyInsertRow(postInput)],
      "return=representation",
    );

    if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
      throw new Error("Failed to create post in Supabase.");
    }

    return mapSupabaseRowToPost(legacyResult.data[0]);
  }

  const posts = await readPosts();
  const post: Post = {
    id: posts.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    ...postInput,
  };

  posts.unshift(post);
  await writePosts(posts);
  return post;
}

export async function deletePostById(id: number): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const targetPost = await getPostById(id);
    const result = await requestSupabase<SupabasePostRow[]>(
      "DELETE",
      `?id=eq.${id}&select=id,title,content,author,author_id,category,date,link_url,file_url,file_name,views`,
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

      await deleteFile(targetPost?.fileUrl);
      return true;
    }

    await deleteFile(targetPost?.fileUrl);
    return true;
  }

  const posts = await readPosts();
  const targetPost = posts.find((post) => post.id === id);
  const filtered = posts.filter((post) => post.id !== id);

  if (filtered.length === posts.length) {
    return false;
  }

  await deleteFile(targetPost?.fileUrl);

  await writePosts(filtered);
  return true;
}

export async function updatePostById(id: number, input: UpdatePostInput): Promise<Post | undefined> {
  const currentPost = await getPostById(id);
  if (!currentPost) {
    return undefined;
  }

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
      `?id=eq.${id}&select=id,title,content,author,author_id,category,date,link_url,file_url,file_name,views`,
      mapPostToSupabaseRow(updatedPost),
      "return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToPost(result.data[0]);
    }

    if (updatedPost.category !== "study") {
      throw new Error(CATEGORY_SCHEMA_MESSAGE);
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

// Emoji Reaction Functions

function getSupabasePostReactionsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }
  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/post_reactions`;
  return `${base}${query}`;
}

function getSupabasePostCommentReactionsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }
  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/post_comment_reactions`;
  return `${base}${query}`;
}

async function requestSupabasePostReactions<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabasePostReactionsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

async function requestSupabasePostCommentReactions<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabasePostCommentReactionsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

export async function addPostReaction(
  postId: number,
  memberId: string,
  emoji: string,
): Promise<PostReaction | undefined> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostReactions<SupabasePostReactionRow[]>(
      "POST",
      "",
      [{ post_id: postId, member_id: memberId, emoji }],
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToPostReaction(result.data[0]);
  }

  return undefined;
}

export async function removePostReaction(
  postId: number,
  memberId: string,
  emoji: string,
): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostReactions(
      "DELETE",
      `?post_id=eq.${postId}&member_id=eq.${encodeURIComponent(memberId)}&emoji=eq.${encodeURIComponent(emoji)}`,
    );
    return result.ok;
  }

  return false;
}

export async function getPostReactions(postId: number): Promise<PostReaction[]> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostReactions<SupabasePostReactionRow[]>(
      "GET",
      `?select=id,post_id,member_id,emoji,created_at&post_id=eq.${postId}`,
    );

    if (!result.ok || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.map(mapSupabaseRowToPostReaction);
  }

  return [];
}

export async function addPostCommentReaction(
  commentId: number,
  memberId: string,
  emoji: string,
): Promise<PostCommentReaction | undefined> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostCommentReactions<SupabasePostCommentReactionRow[]>(
      "POST",
      "",
      [{ comment_id: commentId, member_id: memberId, emoji }],
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToPostCommentReaction(result.data[0]);
  }

  return undefined;
}

export async function removePostCommentReaction(
  commentId: number,
  memberId: string,
  emoji: string,
): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostCommentReactions(
      "DELETE",
      `?comment_id=eq.${commentId}&member_id=eq.${encodeURIComponent(memberId)}&emoji=eq.${encodeURIComponent(emoji)}`,
    );
    return result.ok;
  }

  return false;
}

export async function getPostCommentReactions(commentId: number): Promise<PostCommentReaction[]> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabasePostCommentReactions<SupabasePostCommentReactionRow[]>(
      "GET",
      `?select=id,comment_id,member_id,emoji,created_at&comment_id=eq.${commentId}`,
    );

    if (!result.ok || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.map(mapSupabaseRowToPostCommentReaction);
  }

  return [];
}
