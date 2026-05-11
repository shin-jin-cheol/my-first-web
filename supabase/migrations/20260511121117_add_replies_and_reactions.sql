-- 대댓글용 parent_id 추가
alter table post_comments 
  add column if not exists parent_id bigint references post_comments(id) on delete cascade;

alter table guest_post_comments 
  add column if not exists parent_id bigint references guest_post_comments(id) on delete cascade;

-- 게시글 이모지 반응
create table if not exists post_reactions (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade not null,
  member_id text references members(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(post_id, member_id, emoji)
);

-- 게시글 댓글 이모지 반응
create table if not exists post_comment_reactions (
  id bigint generated always as identity primary key,
  comment_id bigint references post_comments(id) on delete cascade not null,
  member_id text references members(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(comment_id, member_id, emoji)
);

-- 게스트 게시글 이모지 반응
create table if not exists guest_post_reactions (
  id bigint generated always as identity primary key,
  guest_post_id bigint references guest_posts(id) on delete cascade not null,
  member_id text references members(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(guest_post_id, member_id, emoji)
);

-- 게스트 댓글 이모지 반응
create table if not exists guest_comment_reactions (
  id bigint generated always as identity primary key,
  comment_id bigint references guest_post_comments(id) on delete cascade not null,
  member_id text references members(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(comment_id, member_id, emoji)
);
