-- members 테이블 컬럼 추가
alter table members add column if not exists email text;
alter table members add column if not exists email_verified boolean default false;
alter table members add column if not exists auth_user_id text;

-- posts 테이블 컬럼 추가
alter table posts add column if not exists author text;
alter table posts add column if not exists date text;
alter table posts add column if not exists link_url text;
alter table posts add column if not exists file_url text;
alter table posts add column if not exists file_name text;

-- guest_posts 테이블 컬럼 추가
alter table guest_posts add column if not exists date text;
alter table guest_posts add column if not exists link_url text;
alter table guest_posts add column if not exists file_url text;
alter table guest_posts add column if not exists file_name text;

-- post_comments 테이블 컬럼 추가
alter table post_comments add column if not exists date_time text;
