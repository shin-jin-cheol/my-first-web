# TODO

## 2026-06-04 채팅 메시지 읽음 표시 완료

- [x] `messages.is_read` boolean 컬럼 추가 마이그레이션 작성
- [x] 내가 보낸 메시지 중 상대방이 아직 읽지 않은 메시지에 카카오톡 스타일 `1` 표시
- [x] 상대방이 읽으면 Supabase Realtime UPDATE 이벤트로 `1` 표시 제거
- [x] 전체모드와 플로팅 채팅창 모두 읽음 표시 적용
- [x] INSERT/UPDATE Realtime 채널 분리 및 실패 시 재구독 처리
- [x] 채팅창 열림, 브라우저 탭 포커스 복귀, 플로팅 전환 시 서버에서 최신 `is_read` 상태 동기화
- [x] `lib/chat.ts`, `app/chat/[roomId]/actions.ts`, `app/components/ChatPanel.tsx`, `app/components/GlobalChatWindow.tsx` 반영
- [x] `supabase/migrations/20260604000001_add_is_read_to_messages.sql` 작성

## 2026-05-31 최신 완료 반영

### 묶음 A: 모바일 첫인상 개선

- [x] 모바일 첫 접속 시 BGM 플레이어 최소화 상태로 시작
- [x] 오프라인 감지 배너 추가
- [x] 스크롤 시 nav 숨김/표시 처리
- [x] 채팅 페이지에서는 nav 숨김/표시 예외 처리

### 묶음 B: 채팅 모바일 최적화

- [x] 모바일 채팅 전체화면 nav 고정
- [x] 입력창 font-size 16px 이상 적용으로 키보드 화면 확대 방지
- [x] 채팅 이미지 탭 확대 보기
- [x] 플로팅 전환 시 이전 페이지 복귀 흐름 적용
- [x] `PostNewForm`, `GuestNewForm` 작성 내용 `localStorage` 자동 저장

### 묶음 C: UI 레이아웃 개편

- [x] 모바일 최소화 탭 좌우 배열
- [x] 모바일 전용 footer 최소화
- [x] 상태별 자동 전환 텍스트 적용
- [x] `뮤직` 텍스트를 `음악`으로 변경

### 묶음 D: 성능 최적화

- [x] 이미지 업로드 canvas API 자동 리사이징
- [x] 업로드 이미지 최대 1200px 기준 축소
- [x] 게시글 목록 스켈레톤 UI
- [x] 게스트 게시판 목록 스켈레톤 UI
- [x] 친구 목록 스켈레톤 UI

### 묶음 E: 게시글 필터

- [x] 최신순/조회순/좋아요순/댓글순 정렬
- [x] URL `searchParams` 기반 정렬
- [x] 카테고리 필터와 정렬 동시 사용
- [x] 조회순 정렬 컬럼 `views` 적용
- [x] 로컬 fallback 정렬 기준 동기화
- [x] `like_count`, `comment_count` 자동 업데이트

### 추가 UI/UX 수정

- [x] 채팅 전체화면 카드 둥근 모서리와 하단 여백 조정
- [x] 플로팅 채팅창 BGM 플레이어 상태 연동
- [x] 플로팅 채팅 Realtime 구독 추가
- [x] 데스크탑 BGM/채팅 최소화 탭 footer 위 정렬
- [x] BGM 펼침 시 채팅창 위로 올리기
- [x] 모바일 nav 제목 중앙 정렬
- [x] 모바일 footer 하단 여백 조정

## 완료

### Core

- [x] 블로그 게시글 CRUD
- [x] 게스트 게시글 CRUD
- [x] 카테고리 시스템
- [x] 검색 기능
- [x] 파일 첨부
- [x] 링크 첨부
- [x] Ch10 게시글 CRUD 완료
- [x] `/posts` 목록 Supabase 또는 local fallback 연결
- [x] `/posts/[id]` 상세 연결
- [x] `/posts/new` 작성 연결
- [x] 작성자에게만 수정/삭제 UI 표시
- [x] Ch11 posts 테이블 RLS 활성화
- [x] posts RLS 마이그레이션 생성
- [x] `posts_select_public` SELECT 누구나 가능 정책 적용
- [x] `posts_insert_authenticated` INSERT 로그인 사용자 및 `author_id = auth.uid()` 정책 적용
- [x] `posts_update_owner` UPDATE 작성자만 가능 정책 적용
- [x] `posts_delete_owner` DELETE 작성자만 가능 정책 적용
- [x] posts RLS INSERT/UPDATE/DELETE 정책을 service_role 기반으로 수정
- [x] `supabase/migrations/20260526164049_fix_posts_rls.sql` 마이그레이션 작성
- [x] posts_category_valid 제약 조건에 `notice` 카테고리 추가
- [x] `supabase/migrations/20260526170435_fix_posts_category_constraint.sql` 마이그레이션 작성
- [x] `lib/posts.ts` 레거시 카테고리 체크 코드 제거
- [x] `lib/guest-posts.ts` 레거시 카테고리 체크 코드 제거
- [x] guest_posts RLS 비활성화
- [x] `supabase/migrations/20260526173544_disable_guest_posts_rls.sql` 마이그레이션 작성
- [x] Supabase `friends` 테이블 생성 및 RLS 정책 적용
- [x] `supabase/migrations/20260521055613_add_friends_table.sql` 마이그레이션 작성
- [x] Supabase `chat_rooms`, `messages` 테이블 생성
- [x] `supabase/migrations/20260529004057_add_chat_tables.sql` 마이그레이션 작성
- [x] Supabase Realtime `messages` 테이블 등록

### 댓글/반응

- [x] 블로그 댓글 CRUD
- [x] 게스트 댓글 CRUD
- [x] 대댓글 기능
- [x] 게시글 이모지 반응
- [x] 댓글 이모지 반응
- [x] 이름 기반 댓글 아바타

### 인증/회원

- [x] 자체 세션 쿠키 기반 로그인
- [x] 이메일 OTP 기반 회원가입/로그인 흐름
- [x] 세션 쿠키 서명
- [x] 회원 프로필 수정
- [x] 회원 비밀번호 변경
- [x] 회원 탈퇴
- [x] Owner 전용 회원 관리
- [x] Owner 비밀번호 해시 비교
- [x] `proxy.ts` 보호 라우트 추가
- [x] `proxy.ts` `/friends` 보호 라우트 추가
- [x] 비로그인 사용자 `/auth/login` 리다이렉트

### 친구

- [x] `lib/friends.ts` 친구 CRUD 함수 추가
- [x] `app/friends/actions.ts` 친구 기능 Server Actions 추가
- [x] `/friends` 페이지 추가
- [x] 사용자 이름 검색(owner 포함)
- [x] 받은 친구 요청 수락/거절
- [x] 친구 목록 조회
- [x] 친구 삭제
- [x] `/profile/[id]` 친구 요청/수락/거절/삭제 버튼 추가
- [x] `NavMenuMobile.tsx` 친구 링크 추가
- [x] `lib/env.ts` `SUPABASE_FRIENDS_TABLE` 상수 추가

### 라이브 채팅

- [x] `lib/chat.ts` 채팅 CRUD 함수와 타입 추가
- [x] `getOrCreateRoom()`, `getMessages()`, `sendMessage()`, `getRoom()`, `isChatRoomParticipant()` 구현
- [x] `/chat/[roomId]` 채팅 페이지 추가
- [x] `app/chat/[roomId]/ChatWindow.tsx` Supabase Realtime 구독 추가
- [x] `app/chat/[roomId]/actions.ts` 메시지 전송 Server Action 추가
- [x] `app/friends/FriendChatButton.tsx` 친구 목록 채팅 버튼 추가
- [x] `app/friends/actions.ts` `getChatRoomAction()` 추가
- [x] `app/friends/page.tsx` 친구 항목 채팅 버튼 추가
- [x] `PostsMenu.tsx` 데스크탑 nav 채팅 링크 추가
- [x] `NavMenuMobile.tsx` 모바일 nav 채팅 링크 추가
- [x] `proxy.ts` `/chat/:path*` 보호 라우트 추가
- [x] Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가

### UI/UX

- [x] 다크/라이트 시스템 테마
- [x] 반응 UI 레이아웃
- [x] 모바일 내비게이션
- [x] 다국어 텍스트 처리
- [x] BGM 플레이어
- [x] 라이브 시계
- [x] 스크롤 애니메이션 (`ScrollReveal`)
- [x] 네비게이션 바 간결화
- [x] `PostsMenu.tsx` 게시글 드롭다운
- [x] 글쓰기 버튼 텍스트 "새 글 쓰기" 통일

### 프로필

- [x] 프로필 페이지 (`/profile/[id]`)
- [x] owner 프로필 블로그 게시글 목록 표시
- [x] member 프로필 게스트 게시글 목록 표시
- [x] nav 아바타, 게시글 작성자, 댓글 작성자 프로필 링크
- [x] `NavMenuMobile` 프로필 링크 추가
- [x] 프로필 아바타 업로드 버튼 표시 및 owner 아바타 업로드 구현
- [x] 게시글/댓글/프로필 화면에 owner 아바타 반영

### 안정화/구조

- [x] 환경 변수 중앙화
- [x] Supabase HTTP 요청 공통화
- [x] Supabase Storage/Blob/local fallback 저장 전략
- [x] 안전한 JSON 파싱
- [x] 권한 체크 공통화
- [x] Supabase Auth 미사용으로 `auth.uid()` 기반 RLS 쓰기 정책을 사용하지 않는 아키텍처 결정 문서화
- [x] `lib/permissions.ts` 기반 서버 사이드 권한 검증 유지
- [x] `app/posts/actions.ts`, `app/guest/actions.ts` Server Action 세션/권한 검증 유지
- [x] `proxy.ts` 보호 라우트 차단 유지
- [x] 채팅 Server Component/Server Action 참여자 권한 검증 유지
- [x] posts 테이블 RLS 활성화 및 INSERT/UPDATE/DELETE service_role 기반 정책 결정 문서화
- [x] guest_posts 테이블 RLS 비활성화 결정 문서화
- [x] chat_rooms/messages 테이블 RLS 비활성화 및 서버 사이드 권한 검증 결정 문서화
- [x] KST 날짜 유틸
- [x] FormData 유틸
- [x] Next.js 16 기준 `middleware.ts` 제거 및 `proxy.ts` 전환
- [x] `.agent/rules/project.md` 생성
- [x] 규칙 위반 코드 수정 (env 중앙화, CSS variables)
- [x] `lib/env.ts`에 `NODE_ENV`, `IS_VERCEL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
- [x] `lib/auth/session.ts`, `lib/storage.ts`, `lib/supabase/client.ts`, `app/layout.tsx` env 중앙화
- [x] `lib/supabase/http.ts` try/catch 기반 에러 처리 정리
- [x] `proxy.ts` 자체 세션 쿠키 서명 검증 유지
- [x] `components/comment-thread.tsx` `text-white`를 `text-[var(--surface)]`로 수정
- [x] `supabase/migrations/20260520041504_add_posts_rls.sql` 마이그레이션 작성
- [x] `npx supabase db push` 원격 적용 완료

### 검증/배포

- [x] `npm run build` 통과
- [x] `npm run lint` 통과
- [x] 다른 계정 우회 테스트 완료 (사용자 B가 사용자 A 게시글 수정/삭제 실패 확인)
- [x] 민감 키 grep 검사 통과
- [x] 클라이언트 컴포넌트에서 service_role 키 미사용 확인
- [x] GitHub push 완료
- [x] Vercel 빌드/배포 검증 완료
- [x] Playwright E2E 테스트 2개 통과
- [x] 보안 grep 3개 통과
- [x] Vercel 수동 검증 5개 완료
- [x] Ch13 검증 보고서 작성 (`docs/verification-report.md`)

---

## 최신 완료 반영

### UI/UX 수정

- [x] 첨부파일 UI 하단 잘림 수정
- [x] 회원정보 나가기 버튼을 홈으로 이동하도록 변경
- [x] 햄버거 메뉴 친구/채팅 통합
- [x] 내 프로필 텍스트 변경
- [x] 테마/언어 설정 토글 스타일 변경
- [x] BGM 정지 후 클릭 재생 버그 수정
- [x] 모바일 뮤직 플레이어 중앙 정렬
- [x] 모바일 footer 하단 여백 조정
- [x] 모바일 nav 제목 중앙 정렬
- [x] 모바일 버튼 줄바꿈 방지

### 채팅 개선

- [x] Enter 키 전송 지원
- [x] 채팅방 상단 상대방 이름과 아바타 표시
- [x] 새 메시지 수신 시 자동 스크롤
- [x] 채팅 사진 전송 기능
- [x] 데스크탑/모바일 플로팅 및 최소화 전환
- [x] 메시지 아바타 1분 기준 그룹핑
- [x] 채팅창 카드 둥근 모서리 스타일 조정
- [x] 채팅 전역 상태 관리를 위한 `ChatContext` 추가
- [x] `GlobalChatWindow` 신규 생성
- [x] 뮤직 플레이어 최소화 연동을 위한 `PlayerContext` 사용
- [x] Supabase Storage `chat-images` 버킷 추가
- [x] `SUPABASE_CHAT_IMAGES_BUCKET` 환경 변수 추가
- [x] `messages.image_url` 컬럼 추가
- [x] `supabase/migrations/20260530190901_add_image_url_to_messages.sql` 마이그레이션 작성

### 알림 기능

- [x] `notifications` 테이블 생성
- [x] 친구 요청 알림 생성
- [x] 댓글 알림 생성
- [x] 채팅 알림 생성
- [x] nav 알림 아이콘과 안읽음 뱃지 추가
- [x] Supabase Realtime 기반 알림 드롭다운 UI 추가
- [x] 모두 읽음 처리
- [x] 티파니 블루 시그니처 컬러 적용
- [x] `SUPABASE_NOTIFICATIONS_TABLE` 환경 변수 추가
- [x] `lib/notifications.ts` 추가
- [x] `app/components/NotificationBell.tsx` 추가
- [x] `supabase/migrations/20260530205656_add_notifications_table.sql` 마이그레이션 작성

### 게시글 이미지 첨부

- [x] `posts.image_url` 컬럼 추가
- [x] `guest_posts.image_url` 컬럼 추가
- [x] 게시글 작성 시 이미지 업로드 지원
- [x] 게시글 수정 시 이미지 업로드/교체 지원
- [x] 게시글 본문 이미지 표시
- [x] Supabase Storage `post-images` 버킷 추가
- [x] `SUPABASE_POST_IMAGES_BUCKET` 환경 변수 추가
- [x] `supabase/migrations/20260530000000_add_image_url_to_posts.sql` 마이그레이션 작성

### E2E 테스트 CI 자동화

- [x] `.github/workflows/e2e.yml` 생성
- [x] GitHub Actions push 시 Playwright 자동 실행
- [x] GitHub Repository Variable `PLAYWRIGHT_BASE_URL` 설정 반영

### 미구현/보류 항목 상태 정정

- [x] Supabase Realtime 알림 구현 완료
- [x] E2E 테스트 CI 자동화 구현 완료
- [x] 업로드형 프로필 이미지는 owner/member 아바타 업로드 1차 구현 완료
## 2026-06-04 완료 반영

- [x] HTML 파일 업로드 허용 (`lib/attachment-utils.ts` `ALLOWED_ATTACHMENT_MIME_TYPES`에 `text/html` 추가)
- [x] 헤더 뒤로가기 버튼 추가 (`app/components/BackButton.tsx`)
- [x] 홈(`/`) 제외 모든 페이지에서 뒤로가기 버튼 표시
- [x] `BackButton`에서 `usePathname()`으로 홈 여부 감지
- [x] `BackButton`에서 `useRouter().back()` 동작 적용
- [x] `Header.tsx` 모바일 사이트 타이틀 왼쪽에 `BackButton` 배치
- [x] `Header.tsx` 데스크탑 사이트 타이틀 왼쪽에 `BackButton` 배치
- [x] 채팅 전체모드 하단 여백 기기별 조정 (`app/chat/[roomId]/page.tsx`)
- [x] 모바일 기본 `bottom-14` 유지
- [x] `md`/`lg`/`xl` 구간 `bottom-[165px]` 적용
- [x] `2xl` 이상 `bottom-28` 유지
- [x] 아이패드 11인치 1180px가 Tailwind `lg` 구간임을 문서화

### YouTube 영상 임베드

- [x] YouTube 영상 임베드 기능 추가
- [x] `posts.youtube_url` 컬럼 마이그레이션 작성
- [x] `guest_posts.youtube_url` 컬럼 마이그레이션 작성
- [x] `supabase/migrations/20260604000000_add_youtube_url_to_posts.sql` 작성
- [x] 블로그 게시글 작성/수정 화면 YouTube URL 입력 지원
- [x] 게스트 게시글 작성/수정 화면 YouTube URL 입력 지원
- [x] 블로그/게스트 게시글 상세 화면 YouTube iframe 임베드
- [x] `watch?v=` 형식 YouTube 영상 ID 추출 지원
- [x] `youtu.be/` 형식 YouTube 영상 ID 추출 지원
- [x] `lib/posts.ts`, `lib/guest-posts.ts`, `lib/attachment-utils.ts` YouTube URL 흐름 반영
