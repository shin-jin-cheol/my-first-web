-- members: 회원 테이블
create table if not exists members (
  id text primary key,
  name text not null,
  password text not null,
  role text not null default 'member',
  created_at timestamptz default now()
);

-- posts: 블로그 게시글
create table if not exists posts (
  id bigint generated always as identity primary key,
  author_id text references members(id),
  author_name text not null,
  title text not null,
  content text not null,
  category text not null,
  created_at timestamptz default now()
);

-- guest_posts: 게스트 게시글
create table if not exists guest_posts (
  id bigint generated always as identity primary key,
  author_id text references members(id),
  author_name text not null,
  title text not null,
  content text not null,
  category text not null,
  created_at timestamptz default now()
);

-- post_comments: 게시글 댓글
create table if not exists post_comments (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade,
  author_id text references members(id),
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);