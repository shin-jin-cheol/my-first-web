-- posts_category_valid 제약 조건 수정
-- notice 카테고리 추가
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_valid;
ALTER TABLE posts ADD CONSTRAINT posts_category_valid
CHECK (category = ANY (ARRAY['study'::text, 'daily'::text, 'info'::text, 'notice'::text]));
