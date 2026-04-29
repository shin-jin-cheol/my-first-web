export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_AUTH_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

export const SUPABASE_MEMBERS_TABLE = process.env.SUPABASE_MEMBERS_TABLE || "members";
export const SUPABASE_POSTS_TABLE = process.env.SUPABASE_POSTS_TABLE || "posts";
export const SUPABASE_GUEST_POSTS_TABLE = process.env.SUPABASE_GUEST_POSTS_TABLE || "guest_posts";
export const SUPABASE_POST_COMMENTS_TABLE = process.env.SUPABASE_POST_COMMENTS_TABLE || "post_comments";
export const SUPABASE_UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";

export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
