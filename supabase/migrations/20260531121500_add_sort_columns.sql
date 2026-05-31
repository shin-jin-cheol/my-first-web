alter table posts add column if not exists view_count integer default 0;
alter table posts add column if not exists like_count integer default 0;
alter table posts add column if not exists comment_count integer default 0;

alter table guest_posts add column if not exists view_count integer default 0;
alter table guest_posts add column if not exists like_count integer default 0;
alter table guest_posts add column if not exists comment_count integer default 0;
