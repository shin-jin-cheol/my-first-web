alter table public.posts
  add column if not exists youtube_url text;

alter table public.guest_posts
  add column if not exists youtube_url text;
