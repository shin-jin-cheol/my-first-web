-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT: 누구나 읽기 가능
CREATE POLICY "posts_select_public"
ON posts FOR SELECT
USING (true);

-- INSERT: 로그인 사용자만, user_id는 auth.uid()와 같아야 함
CREATE POLICY "posts_insert_authenticated"
ON posts FOR INSERT
WITH CHECK (auth.uid()::text = author_id);

-- UPDATE: 작성자만 수정 가능
CREATE POLICY "posts_update_owner"
ON posts FOR UPDATE
USING (auth.uid()::text = author_id)
WITH CHECK (auth.uid()::text = author_id);

-- DELETE: 작성자만 삭제 가능
CREATE POLICY "posts_delete_owner"
ON posts FOR DELETE
USING (auth.uid()::text = author_id);
