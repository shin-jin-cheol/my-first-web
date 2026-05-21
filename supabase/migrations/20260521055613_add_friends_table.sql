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

-- RLS 활성화
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- SELECT: 본인이 요청하거나 받은 친구 관계만 조회 가능
CREATE POLICY "friends_select_own"
ON friends FOR SELECT
USING (
  auth.uid()::text = requester_id OR
  auth.uid()::text = receiver_id
);

-- INSERT: 로그인 사용자만 친구 요청 가능, requester_id는 본인이어야 함
CREATE POLICY "friends_insert_authenticated"
ON friends FOR INSERT
WITH CHECK (auth.uid()::text = requester_id);

-- UPDATE: receiver만 status 변경 가능 (수락/거절)
CREATE POLICY "friends_update_receiver"
ON friends FOR UPDATE
USING (auth.uid()::text = receiver_id)
WITH CHECK (auth.uid()::text = receiver_id);

-- DELETE: 본인이 요청하거나 받은 관계만 삭제 가능
CREATE POLICY "friends_delete_own"
ON friends FOR DELETE
USING (
  auth.uid()::text = requester_id OR
  auth.uid()::text = receiver_id
);
