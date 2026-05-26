-- guest_posts RLS 비활성화
-- 서버 사이드에서 권한 검증하므로 DB 레벨 RLS 불필요
ALTER TABLE guest_posts DISABLE ROW LEVEL SECURITY;
