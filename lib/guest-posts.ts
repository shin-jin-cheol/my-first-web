import { GuestPostCategory, normalizeGuestPostCategory } from "@/lib/post-categories";
import {
  SUPABASE_URL,
  SUPABASE_GUEST_POSTS_TABLE,
  SUPABASE_GUEST_POST_COMMENTS_TABLE,
  SUPABASE_GUEST_POST_REACTIONS_TABLE,
  SUPABASE_GUEST_COMMENT_REACTIONS_TABLE,
} from "@/lib/env";
import { getKstDateString, getKstDateTimeString } from "@/lib/date";
import { requestSupabaseHttp } from "@/lib/supabase/http";
import { normalizeLinkUrl, normalizeYouTubeUrl } from "@/lib/attachment-utils";
import { deleteFile, hasSupabaseStorage, readJsonStorage, saveFile, writeJsonStorage } from "@/lib/storage";
import { getPostSortOrder, normalizePostSort, type PostSortKey } from "@/lib/post-sort";

export type GuestPost = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  category: GuestPostCategory;
  date: string;
  linkUrl?: string;
  youtubeUrl?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  comments?: GuestComment[];
  views: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
};

export type GuestComment = {
  id: number;
  authorId: string;
  authorName: string;
  content: string;
  dateTime: string;
  parentId?: number;
};

export type GuestPostReaction = {
  id: number;
  postId: number;
  memberId: string;
  emoji: string;
  createdAt: string;
};

export type GuestCommentReaction = {
  id: number;
  commentId: number;
  memberId: string;
  emoji: string;
  createdAt: string;
};

type NewGuestPostInput = {
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  category: GuestPostCategory;
  linkUrl?: string;
  youtubeUrl?: string;
  imageUrl?: string;
  attachmentFile?: File | null;
};

type UpdateGuestPostInput = {
  title: string;
  content: string;
  category: GuestPostCategory;
  linkUrl?: string;
  youtubeUrl?: string;
  imageUrl?: string;
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
  youtube_url?: string | null;
  image_url: string | null;
  file_url: string | null;
  file_name: string | null;
  views: number | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
};

type SupabaseLegacyGuestPostRow = Omit<SupabaseGuestPostRow, "category" | "views"> & {
  category?: string | null;
  views?: number | null;
  view_count?: number | null;
  like_count?: number | null;
  comment_count?: number | null;
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
  parent_id?: number | null;
};

type SupabaseGuestPostReactionRow = {
  id: number;
  guest_post_id: number;
  member_id: string;
  emoji: string;
  created_at: string;
};

type SupabaseGuestCommentReactionRow = {
  id: number;
  comment_id: number;
  member_id: string;
  emoji: string;
  created_at: string;
};

type GuestPostWithLocalReactions = GuestPost & {
  reactions?: GuestPostReaction[];
};

const GUEST_POSTS_BLOB_KEY = "guest/guest-posts.json";
// SUPABASE_* constants are centralized in lib/env.ts
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
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
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
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
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
    youtubeUrl: row.youtube_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    fileUrl: row.file_url ?? undefined,
    fileName: row.file_name ?? undefined,
    comments: "comments" in row && Array.isArray(row.comments) ? row.comments : [],
    views: row.views ?? row.view_count ?? 0,
    viewCount: row.view_count ?? row.views ?? 0,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
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
    youtube_url: post.youtubeUrl ?? null,
    image_url: post.imageUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
    views: post.views,
    view_count: post.viewCount ?? post.views ?? 0,
    like_count: post.likeCount ?? 0,
    comment_count: post.commentCount ?? 0,
  };
}

function mapGuestPostToSupabaseInsertRow(post: Omit<GuestPost, "id">) {
  return {
    title: post.title,
    content: post.content,
    author_id: post.authorId,
    author_name: post.authorName ?? null,
    category: post.category,
    date: post.date,
    link_url: post.linkUrl ?? null,
    youtube_url: post.youtubeUrl ?? null,
    image_url: post.imageUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
    views: post.views,
    view_count: post.viewCount ?? post.views ?? 0,
    like_count: post.likeCount ?? 0,
    comment_count: post.commentCount ?? 0,
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
    image_url: post.imageUrl ?? null,
    file_url: post.fileUrl ?? null,
    file_name: post.fileName ?? null,
  };
}

function mapGuestPostToSupabaseLegacyInsertRow(post: Omit<GuestPost, "id">) {
  return {
    title: post.title,
    content: post.content,
    author_id: post.authorId,
    author_name: post.authorName ?? null,
    date: post.date,
    link_url: post.linkUrl ?? null,
    image_url: post.imageUrl ?? null,
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
    parentId: row.parent_id ?? undefined,
  };
}

function mapGuestCommentToSupabaseRow(postId: number, comment: Omit<GuestComment, "id">) {
  return {
    guest_post_id: postId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    content: comment.content,
    created_at: new Date().toISOString(),
    parent_id: comment.parentId ?? null,
  };
}

function mapSupabaseRowToGuestPostReaction(row: SupabaseGuestPostReactionRow): GuestPostReaction {
  return {
    id: row.id,
    postId: row.guest_post_id,
    memberId: row.member_id,
    emoji: row.emoji,
    createdAt: row.created_at,
  };
}

function mapSupabaseRowToGuestCommentReaction(
  row: SupabaseGuestCommentReactionRow,
): GuestCommentReaction {
  return {
    id: row.id,
    commentId: row.comment_id,
    memberId: row.member_id,
    emoji: row.emoji,
    createdAt: row.created_at,
  };
}

async function updateGuestPostLikeCount(postId: number, delta: number) {
  const currentPost = await getGuestPostById(postId);
  if (!currentPost) {
    return;
  }

  await requestSupabase(
    "PATCH",
    `?id=eq.${postId}`,
    { like_count: Math.max((currentPost.likeCount ?? 0) + delta, 0) },
    "return=minimal",
  );
}

async function updateGuestPostCommentCount(postId: number, delta: number) {
  const currentPost = await getGuestPostById(postId);
  const currentCommentCount = currentPost?.commentCount ?? 0;
  const body = { comment_count: Math.max(currentCommentCount + delta, 0) };

  await requestSupabase(
    "PATCH",
    `?id=eq.${postId}`,
    body,
    "return=minimal",
  );
}

function normalizeGuestPostRecord(
  post: Omit<GuestPost, "category" | "views"> & { category?: string; views?: number },
): GuestPost {
  return {
    ...post,
    category: normalizeGuestPostCategory(post.category),
    views: post.views ?? 0,
  };
}

function getGuestPostSortValue(post: GuestPost, sort: PostSortKey) {
  switch (sort) {
    case "views":
      return post.views ?? 0;
    case "likes":
      return post.likeCount ?? 0;
    case "comments":
      return post.commentCount ?? 0;
    case "latest":
    default:
      return new Date(post.date).getTime() || 0;
  }
}

function sortGuestPosts(posts: GuestPost[], sort: PostSortKey) {
  return [...posts].sort((first, second) => {
    const difference = getGuestPostSortValue(second, sort) - getGuestPostSortValue(first, sort);
    if (difference !== 0) {
      return difference;
    }

    return second.id - first.id;
  });
}

async function readGuestCommentsFromSupabase(postId?: number): Promise<Map<number, GuestComment[]> | null> {
  const postFilter = typeof postId === "number" ? `&guest_post_id=eq.${postId}` : "";
  const result = await requestSupabaseGuestComments<SupabaseGuestCommentRow[]>(
    "GET",
    `?select=id,guest_post_id,author_id,author_name,content,created_at,parent_id${postFilter}&order=id.asc`,
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

async function readGuestPostsFromSupabase(sort: PostSortKey = "latest"): Promise<GuestPost[]> {
  const result = await requestSupabase<SupabaseGuestPostRow[]>(
    "GET",
    `?select=id,title,content,author_id,author_name,category,date,link_url,youtube_url,image_url,file_url,file_name,views,view_count,like_count,comment_count&order=${getPostSortOrder(sort)}`,
  );

  if (result.ok && Array.isArray(result.data)) {
    const commentsByPostId = await readGuestCommentsFromSupabase();
    if (!commentsByPostId) {
      const commentsResult = await requestSupabase<SupabaseGuestPostWithCommentsRow[]>(
        "GET",
        `?select=id,title,content,author_id,author_name,category,date,link_url,youtube_url,image_url,file_url,file_name,views,view_count,like_count,comment_count,comments&order=${getPostSortOrder(sort)}`,
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
    `?select=id,title,content,author_id,author_name,date,link_url,image_url,file_url,file_name,views,view_count,like_count,comment_count&order=${getPostSortOrder(sort)}`,
  );

  if (!legacyResult.ok || !Array.isArray(legacyResult.data)) {
    const commentsResult = await requestSupabase<SupabaseGuestPostWithCommentsRow[]>(
      "GET",
      `?select=id,title,content,author_id,author_name,category,date,link_url,youtube_url,image_url,file_url,file_name,views,view_count,like_count,comment_count,comments&order=${getPostSortOrder(sort)}`,
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
        `?select=id,title,content,author_id,author_name,date,link_url,image_url,file_url,file_name,views,view_count,like_count,comment_count,comments&order=${getPostSortOrder(sort)}`,
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

  if (rows.length === 0) {
    return;
  }

  const result = await requestSupabase(
    "POST",
    "?on_conflict=id",
    rows,
    "resolution=merge-duplicates,return=minimal",
  );

  if (result.ok) {
    return;
  }

  const legacyResult = await requestSupabase(
    "POST",
    "?on_conflict=id",
    posts.map(mapGuestPostToSupabaseLegacyRow),
    "resolution=merge-duplicates,return=minimal",
  );

  if (!legacyResult.ok) {
    throw new Error("Failed to sync guest posts to Supabase.");
  }
}

async function readGuestPostsFromLegacyStorage(): Promise<GuestPost[]> {
  return readJsonStorage({
    blobKey: GUEST_POSTS_BLOB_KEY,
    localFileName: "guest-posts.json",
    tmpFileName: "my-first-web-guest-posts.json",
    seedData: [] as Array<Omit<GuestPost, "category" | "views"> & { category?: string; views?: number }>,
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

async function readGuestPosts(sort: PostSortKey = "latest"): Promise<GuestPost[]> {
  if (!hasSupabaseStorage()) {
    return sortGuestPosts(await readGuestPostsFromLegacyStorage(), sort);
  }

  const supabasePosts = await readGuestPostsFromSupabase(sort);
  if (supabasePosts.length > 0 || hasTriedSupabaseGuestBootstrap) {
    return supabasePosts;
  }

  hasTriedSupabaseGuestBootstrap = true;
  const legacyPosts = await readGuestPostsFromLegacyStorage();
  if (legacyPosts.length === 0) {
    return [];
  }

  await syncGuestPostsToSupabase(legacyPosts);
  return readGuestPostsFromSupabase(sort);
}

async function writeGuestPosts(posts: GuestPost[]) {
  if (hasSupabaseStorage()) {
    await syncGuestPostsToSupabase(posts);
    return;
  }

  await writeGuestPostsToLegacyStorage(posts);
}

export async function getGuestPosts(sort: string | null | undefined = "latest"): Promise<GuestPost[]> {
  return readGuestPosts(normalizePostSort(sort));
}

export async function getGuestPostById(id: number): Promise<GuestPost | undefined> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabase<SupabaseGuestPostRow[]>(
      "GET",
      `?select=id,title,content,author_id,author_name,category,date,link_url,youtube_url,image_url,file_url,file_name,views,view_count,like_count,comment_count&id=eq.${id}&limit=1`,
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      const commentsByPostId = await readGuestCommentsFromSupabase(id);
      return {
        ...mapSupabaseRowToGuestPost(result.data[0]),
        comments: commentsByPostId?.get(id) ?? [],
      };
    }

    const legacyResult = await requestSupabase<SupabaseLegacyGuestPostRow[]>(
      "GET",
      `?select=id,title,content,author_id,author_name,date,link_url,image_url,file_url,file_name&id=eq.${id}&limit=1`,
    );

    if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
      return undefined;
    }

    const commentsByPostId = await readGuestCommentsFromSupabase(id);
    return {
      ...mapSupabaseRowToGuestPost(legacyResult.data[0]),
      comments: commentsByPostId?.get(id) ?? [],
    };
  }

  const posts = await readGuestPosts();
  return posts.find((post) => post.id === id);
}

export async function incrementGuestPostViews(postId: number): Promise<void> {
  if (!Number.isFinite(postId) || postId <= 0) {
    return;
  }

  if (hasSupabaseStorage()) {
    const currentPost = await getGuestPostById(postId);
    if (!currentPost) {
      return;
    }

    await requestSupabase(
      "PATCH",
      `?id=eq.${postId}`,
      { views: currentPost.views + 1, view_count: (currentPost.viewCount ?? currentPost.views ?? 0) + 1 },
      "return=minimal",
    );
    return;
  }

  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === postId);
  if (index === -1) {
    return;
  }

  posts[index] = {
    ...posts[index],
    views: posts[index].views + 1,
    viewCount: (posts[index].viewCount ?? posts[index].views ?? 0) + 1,
  };
  await writeGuestPosts(posts);
}

export async function addGuestPost(input: NewGuestPostInput): Promise<GuestPost> {
  const attachment = await saveFile(input.attachmentFile);

  const postInput: Omit<GuestPost, "id"> = {
    title: input.title,
    content: input.content,
    authorId: input.authorId,
    authorName: input.authorName,
    category: normalizeGuestPostCategory(input.category),
    date: getKstDateString(),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    youtubeUrl: normalizeYouTubeUrl(input.youtubeUrl),
    imageUrl: input.imageUrl,
    fileUrl: attachment?.fileUrl,
    fileName: attachment?.fileName,
    views: 0,
  };

  if (hasSupabaseStorage()) {
    const result = await requestSupabase<SupabaseGuestPostRow[]>(
      "POST",
      "",
      [mapGuestPostToSupabaseInsertRow(postInput)],
      "return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToGuestPost(result.data[0]);
    }

    const legacyResult = await requestSupabase<SupabaseLegacyGuestPostRow[]>(
      "POST",
      "",
      [mapGuestPostToSupabaseLegacyInsertRow(postInput)],
      "return=representation",
    );

    if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
      throw new Error("Failed to create guest post in Supabase.");
    }

    return mapSupabaseRowToGuestPost(legacyResult.data[0]);
  }

  const posts = await readGuestPosts();
  const post: GuestPost = {
    id: posts.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    ...postInput,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
  };

  posts.unshift(post);
  await writeGuestPosts(posts);
  return post;
}

export async function deleteGuestPostById(id: number): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const targetPost = await getGuestPostById(id);
    const result = await requestSupabase<SupabaseGuestPostRow[]>(
      "DELETE",
      `?id=eq.${id}&select=id,title,content,author_id,author_name,category,date,link_url,youtube_url,image_url,file_url,file_name,views`,
      undefined,
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      const legacyResult = await requestSupabase<SupabaseLegacyGuestPostRow[]>(
        "DELETE",
        `?id=eq.${id}&select=id,title,content,author_id,author_name,date,link_url,image_url,file_url,file_name`,
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
  const currentPost = await getGuestPostById(id);
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

  const updatedPost: GuestPost = {
    ...currentPost,
    title: input.title,
    content: input.content,
    category: normalizeGuestPostCategory(input.category),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    youtubeUrl: normalizeYouTubeUrl(input.youtubeUrl),
    imageUrl: input.imageUrl,
    fileUrl: nextFileUrl,
    fileName: nextFileName,
  };

  if (hasSupabaseStorage()) {
    const result = await requestSupabase<SupabaseGuestPostRow[]>(
      "PATCH",
      `?id=eq.${id}&select=id,title,content,author_id,author_name,category,date,link_url,youtube_url,image_url,file_url,file_name,views`,
      mapGuestPostToSupabaseRow(updatedPost),
      "return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      const commentsByPostId = await readGuestCommentsFromSupabase(id);
      return {
        ...mapSupabaseRowToGuestPost(result.data[0]),
        comments: commentsByPostId?.get(id) ?? [],
      };
    }

    const legacyResult = await requestSupabase<SupabaseLegacyGuestPostRow[]>(
      "PATCH",
      `?id=eq.${id}&select=id,title,content,author_id,author_name,date,link_url,image_url,file_url,file_name`,
      mapGuestPostToSupabaseLegacyRow(updatedPost),
      "return=representation",
    );

    if (!legacyResult.ok || !Array.isArray(legacyResult.data) || legacyResult.data.length === 0) {
      return undefined;
    }

    const commentsByPostId = await readGuestCommentsFromSupabase(id);
    return {
      ...mapSupabaseRowToGuestPost(legacyResult.data[0]),
      comments: commentsByPostId?.get(id) ?? [],
    };
  }

  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) {
    return undefined;
  }

  posts[index] = updatedPost;
  await writeGuestPosts(posts);
  return updatedPost;
}

export async function addGuestCommentById(
  postId: number,
  input: { authorId: string; authorName: string; content: string; parentId?: number },
): Promise<GuestComment | undefined> {
  if (hasSupabaseStorage()) {
    const comment: Omit<GuestComment, "id"> = {
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content,
      dateTime: getKstDateTimeString(),
      parentId: input.parentId,
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

    await updateGuestPostCommentCount(postId, 1);

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
    parentId: input.parentId,
  };

  posts[index] = {
    ...currentPost,
    comments: [...currentComments, comment],
    commentCount: (currentPost.commentCount ?? 0) + 1,
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
      `?guest_post_id=eq.${postId}&id=eq.${commentId}&select=id,guest_post_id,author_id,author_name,content,created_at,parent_id`,
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

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      await updateGuestPostCommentCount(postId, -1);
    }

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
    commentCount: Math.max((currentPost.commentCount ?? 0) - 1, 0),
  };

  await writeGuestPosts(posts);
  return true;
}

// Emoji Reaction Functions

function getSupabaseGuestPostReactionsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }
  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_GUEST_POST_REACTIONS_TABLE}`;
  return `${base}${query}`;
}

function getSupabaseGuestCommentReactionsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }
  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_GUEST_COMMENT_REACTIONS_TABLE}`;
  return `${base}${query}`;
}

async function requestSupabaseGuestPostReactions<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabaseGuestPostReactionsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

async function requestSupabaseGuestCommentReactions<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  return requestSupabaseHttp<T>(getSupabaseGuestCommentReactionsEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "text",
  });
}

export async function addGuestPostReaction(
  postId: number,
  memberId: string,
  emoji: string,
): Promise<GuestPostReaction | undefined> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestPostReactions<SupabaseGuestPostReactionRow[]>(
      "POST",
      "",
      [{ guest_post_id: postId, member_id: memberId, emoji }],
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    await updateGuestPostLikeCount(postId, 1);

    return mapSupabaseRowToGuestPostReaction(result.data[0]);
  }

  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === postId);
  if (index === -1) {
    return undefined;
  }

  const currentPost = posts[index] as GuestPostWithLocalReactions;
  const currentReactions = currentPost.reactions ?? [];
  const hasReaction = currentReactions.some(
    (reaction) => reaction.memberId === memberId && reaction.emoji === emoji,
  );
  if (hasReaction) {
    return currentReactions.find((reaction) => reaction.memberId === memberId && reaction.emoji === emoji);
  }

  const reaction: GuestPostReaction = {
    id: currentReactions.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    postId,
    memberId,
    emoji,
    createdAt: new Date().toISOString(),
  };

  posts[index] = {
    ...currentPost,
    reactions: [...currentReactions, reaction],
    likeCount: (currentPost.likeCount ?? 0) + 1,
  } as GuestPostWithLocalReactions;

  await writeGuestPosts(posts);
  return reaction;
}

export async function removeGuestPostReaction(
  postId: number,
  memberId: string,
  emoji: string,
): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestPostReactions<SupabaseGuestPostReactionRow[]>(
      "DELETE",
      `?guest_post_id=eq.${postId}&member_id=eq.${encodeURIComponent(memberId)}&emoji=eq.${encodeURIComponent(emoji)}&select=id,guest_post_id,member_id,emoji,created_at`,
      undefined,
      "return=representation",
    );
    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      await updateGuestPostLikeCount(postId, -1);
    }
    return Boolean(result.ok && Array.isArray(result.data) && result.data.length > 0);
  }

  const posts = await readGuestPosts();
  const index = posts.findIndex((post) => post.id === postId);
  if (index === -1) {
    return false;
  }

  const currentPost = posts[index] as GuestPostWithLocalReactions;
  const currentReactions = currentPost.reactions ?? [];
  const nextReactions = currentReactions.filter(
    (reaction) => !(reaction.memberId === memberId && reaction.emoji === emoji),
  );
  if (nextReactions.length === currentReactions.length) {
    return false;
  }

  posts[index] = {
    ...currentPost,
    reactions: nextReactions,
    likeCount: Math.max((currentPost.likeCount ?? 0) - 1, 0),
  } as GuestPostWithLocalReactions;

  await writeGuestPosts(posts);
  return true;
}

export async function getGuestPostReactions(postId: number): Promise<GuestPostReaction[]> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestPostReactions<SupabaseGuestPostReactionRow[]>(
      "GET",
      `?select=id,guest_post_id,member_id,emoji,created_at&guest_post_id=eq.${postId}`,
    );

    if (!result.ok || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.map(mapSupabaseRowToGuestPostReaction);
  }

  const posts = await readGuestPosts();
  const post = posts.find((item) => item.id === postId) as GuestPostWithLocalReactions | undefined;
  return post?.reactions ?? [];
}

export async function addGuestCommentReaction(
  commentId: number,
  memberId: string,
  emoji: string,
): Promise<GuestCommentReaction | undefined> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestCommentReactions<SupabaseGuestCommentReactionRow[]>(
      "POST",
      "",
      [{ comment_id: commentId, member_id: memberId, emoji }],
      "return=representation",
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return undefined;
    }

    return mapSupabaseRowToGuestCommentReaction(result.data[0]);
  }

  return undefined;
}

export async function removeGuestCommentReaction(
  commentId: number,
  memberId: string,
  emoji: string,
): Promise<boolean> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestCommentReactions(
      "DELETE",
      `?comment_id=eq.${commentId}&member_id=eq.${encodeURIComponent(memberId)}&emoji=eq.${encodeURIComponent(emoji)}`,
    );
    return result.ok;
  }

  return false;
}

export async function getGuestCommentReactions(commentId: number): Promise<GuestCommentReaction[]> {
  if (hasSupabaseStorage()) {
    const result = await requestSupabaseGuestCommentReactions<SupabaseGuestCommentReactionRow[]>(
      "GET",
      `?select=id,comment_id,member_id,emoji,created_at&comment_id=eq.${commentId}`,
    );

    if (!result.ok || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.map(mapSupabaseRowToGuestCommentReaction);
  }

  return [];
}
