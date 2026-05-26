-- 기존 INSERT/UPDATE/DELETE 정책 제거
DROP POLICY IF EXISTS "posts_insert_authenticated" ON posts;
DROP POLICY IF EXISTS "posts_update_owner" ON posts;
DROP POLICY IF EXISTS "posts_delete_owner" ON posts;

-- INSERT: service_role로 요청하므로 서버에서 권한 검증
-- SELECT는 그대로 유지
CREATE POLICY "posts_insert_service"
ON posts FOR INSERT
WITH CHECK (true);

-- UPDATE: 서버에서 권한 검증
CREATE POLICY "posts_update_service"
ON posts FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE: 서버에서 권한 검증
CREATE POLICY "posts_delete_service"
ON posts FOR DELETE
USING (true);
