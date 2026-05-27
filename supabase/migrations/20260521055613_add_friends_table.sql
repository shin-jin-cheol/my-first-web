-- friends 테이블 생성
CREATE TABLE IF NOT EXISTS friends (
  id bigint generated always as identity primary key,
  requester_id text not null,
  receiver_id text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (requester_id, receiver_id)
);

-- RLS 비활성화
-- 권한 검증은 Server Action과 lib/friends.ts에서 처리
-- auth.uid()가 자체 세션 쿠키와 연결되지 않아 DB RLS 사용 불가
ALTER TABLE friends DISABLE ROW LEVEL SECURITY;
