export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const IS_VERCEL = Boolean(process.env.VERCEL);
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_AUTH_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

export const SUPABASE_MEMBERS_TABLE = process.env.SUPABASE_MEMBERS_TABLE || "members";
export const SUPABASE_FRIENDS_TABLE = process.env.SUPABASE_FRIENDS_TABLE || "friends";
export const SUPABASE_POSTS_TABLE = process.env.SUPABASE_POSTS_TABLE || "posts";
export const SUPABASE_GUEST_POSTS_TABLE = process.env.SUPABASE_GUEST_POSTS_TABLE || "guest_posts";
export const SUPABASE_POST_COMMENTS_TABLE = process.env.SUPABASE_POST_COMMENTS_TABLE || "post_comments";
export const SUPABASE_GUEST_POST_COMMENTS_TABLE =
  process.env.SUPABASE_GUEST_POST_COMMENTS_TABLE || "guest_post_comments";
export const SUPABASE_POST_REACTIONS_TABLE = process.env.SUPABASE_POST_REACTIONS_TABLE || "post_reactions";
export const SUPABASE_POST_COMMENT_REACTIONS_TABLE =
  process.env.SUPABASE_POST_COMMENT_REACTIONS_TABLE || "post_comment_reactions";
export const SUPABASE_GUEST_POST_REACTIONS_TABLE =
  process.env.SUPABASE_GUEST_POST_REACTIONS_TABLE || "guest_post_reactions";
export const SUPABASE_GUEST_COMMENT_REACTIONS_TABLE =
  process.env.SUPABASE_GUEST_COMMENT_REACTIONS_TABLE || "guest_comment_reactions";
export const SUPABASE_UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";

export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
export const SESSION_SECRET = process.env.SESSION_SECRET ?? "";
export const OWNER_ID = process.env.OWNER_ID ?? "";
export const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "";
export const OWNER_NAME = process.env.OWNER_NAME ?? "";

export function assertRequiredServerEnv() {
  if (!SESSION_SECRET) {
    throw new Error("Missing required server environment variable: SESSION_SECRET");
  }
}
