@AGENTS.md

## 2026-06-04 최신 반영 요약

- HTML 파일 업로드가 허용되었습니다. `lib/attachment-utils.ts`의 허용 MIME 타입에 `text/html`이 포함됩니다.
- `app/components/BackButton.tsx`가 추가되었습니다. 홈(`/`)을 제외한 모든 페이지 헤더에서 표시되며 `router.back()`으로 동작합니다.
- `app/chat/[roomId]/page.tsx` 채팅 전체모드 하단 여백은 모바일 `bottom-14`, `md`/`lg`/`xl` `bottom-[165px]`, `2xl` 이상 `bottom-28` 기준으로 관리합니다.
- Tailwind breakpoint 기준: 기본 768px 미만, `md` 768px 이상, `lg` 1024px 이상, `xl` 1280px 이상, `2xl` 1536px 이상입니다. 아이패드 11인치 1180px는 `lg` 구간입니다.

## 2026-06-04 YouTube 영상 임베드 추가 반영

- YouTube 영상 임베드 기능이 추가되었습니다.
- `posts`, `guest_posts`의 `youtube_url` 컬럼을 사용합니다.
- 작성/수정 화면의 YouTube URL 입력과 상세 화면 iframe 렌더링을 지원합니다.
- `watch?v=VIDEO_ID`, `youtu.be/VIDEO_ID` 형식의 영상 ID 추출을 지원합니다.
- 마이그레이션은 `supabase/migrations/20260604000000_add_youtube_url_to_posts.sql`입니다.
