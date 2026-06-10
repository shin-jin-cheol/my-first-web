# Context

## 0-1. 2026-06-10 최신 컨텍스트

- `lib/supabase/client.ts`는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 `lib/env.ts`에서 import해 사용합니다. 브라우저 Supabase 클라이언트 생성 시 환경변수를 각 파일에서 직접 읽지 않습니다.
- 친구 목록 카드의 채팅 버튼과 친구 삭제 form은 같은 오른쪽 액션 영역에 배치합니다. 이 영역은 `flex shrink-0 items-center gap-2`를 사용해 이름 길이와 관계없이 버튼 위치를 고정합니다.
- 인증/권한 설명은 현재 구조 기준으로 자체 `sjc-session` 쿠키, 이메일 OTP, `proxy.ts`, Server Action, `lib/permissions.ts` 흐름을 사용합니다. Supabase Auth 연동으로 오해될 수 있는 표현은 사용하지 않습니다.
- Next.js 16 보호 라우트는 `proxy.ts`를 사용하며 `middleware.ts`는 사용하지 않습니다.
- GitHub Actions Playwright workflow는 `.github/workflows/e2e.yml`과 `.github/workflows/playwright.yml` 두 파일이 존재합니다.

## 0. 2026-05-31 최신 컨텍스트

이번 최신화는 묶음 A~E와 최근 UI/UX 수정사항을 현재 구현 상태로 기록합니다.

### 묶음 A: 모바일 첫인상 개선

- 모바일 첫 접속 시 BGM 플레이어가 최소화 상태로 시작합니다.
- 오프라인 감지 배너가 추가되어 네트워크 상태를 사용자에게 알립니다.
- 채팅 페이지를 제외한 모바일 화면에서 스크롤 방향에 따라 nav가 숨김/표시됩니다.

### 묶음 B: 채팅 모바일 최적화

- 모바일 채팅 전체화면에서 nav가 고정되도록 정리했습니다.
- 입력창 font-size를 16px 이상으로 유지해 모바일 키보드 표시 시 화면 확대를 방지합니다.
- 채팅 이미지는 탭해서 크게 볼 수 있습니다.
- 채팅을 플로팅/최소화로 전환할 때 가능한 경우 `router.back()`으로 이전 페이지에 복귀합니다.
- `PostNewForm`, `GuestNewForm`은 작성 중인 내용을 `localStorage`에 자동 저장합니다.

### 묶음 C: UI 레이아웃 개편

- 모바일 최소화 탭은 채팅/음악 상태를 좌우 배열로 표시합니다.
- 모바일 전용 footer는 더 작고 낮은 형태로 정리되었습니다.
- 상태별로 `채팅 중`, `재생 중`, `음악` 텍스트가 자동 전환됩니다.
- UI 텍스트는 `뮤직` 대신 `음악`을 사용합니다.

### 묶음 D: 성능 최적화

- 이미지 업로드는 canvas API 기반 자동 리사이징을 사용하며 최대 1200px 기준으로 축소합니다.
- 게시글 목록, 게스트 게시판 목록, 친구 목록에 스켈레톤 UI가 적용되었습니다.

### 묶음 E: 게시글 필터

- 게시글 및 게스트 목록은 최신순/조회순/좋아요순/댓글순 정렬을 지원합니다.
- 정렬은 URL `searchParams` 기반이며 카테고리 필터와 동시에 사용할 수 있습니다.
- 조회순 컬럼은 `view_count`가 아니라 실제 DB 컬럼인 `views`를 사용합니다.
- `like_count`, `comment_count`는 좋아요/댓글 추가 및 삭제 시 자동 업데이트됩니다.

### 추가 UI/UX 수정

- 채팅 전체화면 카드의 둥근 모서리와 footer 위 하단 여백을 조정했습니다.
- 플로팅 채팅창은 BGM 플레이어의 `isMinimized` 상태와 연동됩니다.
- 플로팅 채팅창에 Supabase Realtime 메시지 구독을 추가했습니다.
- 데스크탑 BGM/채팅 최소화 탭은 footer 위에 순서대로 정렬됩니다.
- BGM 펼침 시 채팅창과 채팅 탭이 플레이어 위로 올라가도록 조정했습니다.
- 모바일 nav 제목 중앙 정렬과 모바일 footer 하단 여백 조정이 반영되었습니다.

## 1. 프로젝트 개요

개인 블로그와 회원 기반 게스트 커뮤니티를 함께 제공하는 Next.js 애플리케이션입니다.

- Owner는 블로그 게시글을 운영합니다.
- Member는 게스트 게시판에 글을 작성하고 댓글/반응으로 참여합니다.
- 로그인 사용자는 친구 요청을 보내고, 받은 요청을 수락/거절하며, 친구 목록을 관리할 수 있습니다.
- 친구 관계의 로그인 사용자는 1:1 라이브 채팅을 사용할 수 있습니다.
- 데이터 저장은 Supabase HTTP 클라이언트 패턴을 우선 사용합니다.
- 파일 저장은 Supabase Storage를 우선 사용하고, 기존 흐름에 따라 Vercel Blob 또는 local fallback을 사용합니다.
- 인증은 Supabase Auth가 아니라 자체 세션 쿠키와 이메일 OTP 흐름을 사용합니다.

---

## 2. 기술 스택

- Next.js 16.2.1, App Router only
- React 19.2.4
- TypeScript
- Tailwind CSS 4, CSS variables
- shadcn/ui, Radix UI, lucide-react
- Supabase HTTP client pattern, Supabase Storage
- 자체 세션 쿠키 인증
- 이메일 OTP 회원가입/로그인
- Vercel Blob
- Vercel 배포

---

## 3. 현재 구현된 기능

### 게시글

- 블로그 게시글 CRUD
- 게스트 게시글 CRUD
- `/posts` 목록 Supabase 또는 local fallback 연결
- `/posts/[id]` 상세 연결
- `/posts/new` 작성 연결
- 작성자에게만 수정/삭제 UI 표시
- 카테고리 분류
- 검색
- 파일 첨부
- 링크 첨부
- 조회수
- KST 날짜/시간 처리

### 댓글/반응

- 블로그 댓글 CRUD
- 게스트 댓글 CRUD
- `parent_id` 기반 대댓글
- 게시글 이모지 반응
- 댓글 이모지 반응
- 이름 기반 댓글 아바타
- 댓글 작성자 프로필 링크
- 프로필 페이지 친구 요청/수락/거절/삭제 버튼
- owner 프로필 아바타 업로드와 owner 아바타 반영

### 인증/회원

- 자체 세션 쿠키 기반 로그인 상태 관리
- 이메일 OTP 기반 회원가입/로그인 흐름
- 세션 쿠키 서명
- 회원 프로필 이름 수정
- 회원 비밀번호 변경
- 회원 탈퇴
- Owner 전용 회원 관리 페이지
- Owner 비밀번호 SHA-256 해시 비교
- `proxy.ts` 기반 보호 라우트 리다이렉트
- 친구 기능 접근 보호

보호 라우트:

- `/posts/new`
- `/guest/new`
- `/guest/account`
- `/friends`
- `/chat/:path*`
- `/admin/:path*`

비로그인 사용자는 보호 라우트 접근 시 `/auth/login`으로 리다이렉트됩니다.

### 프로필

- `/profile/[id]` 공개 프로필 페이지
- owner 프로필에서는 블로그 게시글 목록 표시
- member 프로필에서는 게스트 게시글 목록 표시
- 진입 경로: nav 아바타, 게시글 작성자, 댓글 작성자
- 모바일 내비게이션(`NavMenuMobile`)에 프로필 링크 추가
- 모바일 내비게이션(`NavMenuMobile`)에 친구 링크 추가
- owner 프로필의 아바타는 `owner_settings` 테이블에서 읽고 저장합니다.

### 친구

- `/friends` 친구 페이지
- 사용자 이름 검색에서 owner 포함
- 받은 친구 요청 수락/거절
- 친구 목록 조회
- 친구 삭제
- `lib/friends.ts` 친구 CRUD 함수
- `app/friends/actions.ts` 친구 기능 Server Actions
- Supabase `friends` 테이블 및 RLS 정책
- 마이그레이션 파일: `supabase/migrations/20260521055613_add_friends_table.sql`
- `lib/env.ts`의 `SUPABASE_FRIENDS_TABLE` 상수

### 라이브 채팅

- `/chat/[roomId]` 1:1 채팅 페이지
- `lib/chat.ts`의 `ChatRoom`, `Message` 타입과 `getOrCreateRoom()`, `getMessages()`, `sendMessage()`, `getRoom()`, `isChatRoomParticipant()` 함수
- `app/chat/[roomId]/page.tsx` Server Component에서 세션과 참여자 권한 확인 후 초기 메시지 조회
- `app/chat/[roomId]/ChatWindow.tsx` Client Component에서 Supabase Realtime `messages` INSERT 구독
- `app/chat/[roomId]/actions.ts` 메시지 전송 Server Action
- `app/friends/FriendChatButton.tsx` 친구 목록 채팅 버튼
- `app/friends/actions.ts`의 `getChatRoomAction()`
- 데스크탑/모바일 내비게이션 채팅 진입 링크
- `proxy.ts`의 `/chat/:path*` 보호 라우트

### UI/UX

- 다크/라이트 시스템 테마
- 모바일 대응 내비게이션
- `PostsMenu.tsx` 기반 "게시글" 드롭다운 메뉴
- 네비게이션 바 간결화
- role 뱃지 제거
- 회원관리/회원정보 링크 제거
- 회원가입 버튼 제거
- 글쓰기 버튼 텍스트를 "새 글 쓰기"로 통일
- 게시글 목록 스크롤 애니메이션(`ScrollReveal`)
- 다국어(ko/en) 텍스트 처리
- BGM 플레이어
- 라이브 시계
- shadcn/ui 기반 Button/Input/Dialog 등

### 규칙 정리

- `lib/env.ts`에 `NODE_ENV`, `IS_VERCEL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
- `lib/env.ts`에 `SUPABASE_FRIENDS_TABLE`, `SUPABASE_OWNER_SETTINGS_TABLE`, `SUPABASE_AVATARS_BUCKET` 추가
- `lib/auth/session.ts`, `lib/storage.ts`, `lib/supabase/client.ts`, `app/layout.tsx`의 환경 변수 접근을 `lib/env.ts` 기준으로 중앙화
- `lib/supabase/http.ts`의 Supabase HTTP 요청에 try/catch 기반 에러 처리를 추가
- `proxy.ts`의 자체 세션 쿠키 서명 검증을 유지
- `components/comment-thread.tsx`의 `text-white`를 `text-[var(--surface)]`로 수정

---

## 4. 주요 데이터 구조

- `members` (`avatar_url` 포함)
- `owner_settings`
- `posts`
- `guest_posts`
- `post_comments`
- `guest_post_comments`
- `post_reactions`
- `post_comment_reactions`
- `guest_post_reactions`
- `guest_comment_reactions`
- `friends`
- `chat_rooms`
- `messages`
- Supabase Storage `uploads` bucket
- Supabase Storage `avatars` bucket
- local fallback JSON data

`posts` 테이블은 Ch11에서 RLS를 활성화했습니다.

- `posts_select_public`: SELECT 누구나 가능
- `posts_insert_authenticated`: INSERT 로그인 사용자만 가능, `author_id = auth.uid()`
- `posts_update_owner`: UPDATE 작성자만 가능
- `posts_delete_owner`: DELETE 작성자만 가능
- 마이그레이션 파일: `supabase/migrations/20260520041504_add_posts_rls.sql`

Ch13에서 자체 세션 쿠키 인증 흐름과 Supabase service_role 서버 요청 흐름에 맞춰 posts RLS 쓰기 정책을 수정했습니다.

- Supabase Auth를 사용하지 않으므로 `auth.uid()`는 자체 세션 쿠키 사용자 ID를 알 수 없고 null을 반환합니다.
- 따라서 auth.uid() 기반 INSERT/UPDATE/DELETE RLS 정책은 자체 로그인 사용자 권한 검증에 사용할 수 없습니다.
- 기존 INSERT/UPDATE/DELETE 정책을 제거했습니다.
- `posts_insert_service`: INSERT는 서버 사이드 권한 검증 후 service_role 요청으로 허용합니다.
- `posts_update_service`: UPDATE는 서버 사이드 권한 검증 후 service_role 요청으로 허용합니다.
- `posts_delete_service`: DELETE는 서버 사이드 권한 검증 후 service_role 요청으로 허용합니다.
- 마이그레이션 파일: `supabase/migrations/20260526164049_fix_posts_rls.sql`
- `posts_category_valid` 제약 조건에 `notice` 카테고리를 추가했습니다.
- 마이그레이션 파일: `supabase/migrations/20260526170435_fix_posts_category_constraint.sql`

`guest_posts` 테이블은 Ch13에서 서버 사이드 권한 검증 흐름에 맞춰 RLS를 비활성화했습니다.

- 서버 사이드에서 작성/수정/삭제 권한을 검증하므로 DB 레벨 RLS를 사용하지 않습니다.
- 마이그레이션 파일: `supabase/migrations/20260526173544_disable_guest_posts_rls.sql`

`friends` 테이블은 친구 요청과 친구 관계를 저장하며 RLS를 적용했습니다.

- 요청자/수신자 기준으로 본인 관련 친구 레코드만 조회/변경/삭제할 수 있습니다.
- 마이그레이션 파일: `supabase/migrations/20260521055613_add_friends_table.sql`

`chat_rooms`와 `messages` 테이블은 1:1 라이브 채팅을 저장합니다.

- `chat_rooms`는 `user_a_id < user_b_id` 정렬 제약과 `(user_a_id, user_b_id)` 유니크 제약으로 사용자 쌍당 하나의 방만 허용합니다.
- `messages`는 `room_id`로 `chat_rooms(id)`를 참조하며 채팅방 삭제 시 함께 삭제됩니다.
- 서버 사이드 세션/참여자 권한 검증을 기준으로 RLS를 비활성화했습니다.
- `messages` 테이블은 Supabase Realtime publication에 등록했습니다.
- 마이그레이션 파일: `supabase/migrations/20260529004057_add_chat_tables.sql`

---

## 5. 주요 규칙

- App Router만 사용합니다.
- 기본은 Server Component입니다.
- `"use client"`는 상태, 이벤트 핸들러, 브라우저 API가 필요한 경우에만 사용합니다.
- Server Actions의 흐름과 반환 구조를 임의로 바꾸지 않습니다.
- 환경 변수는 `lib/env.ts` 기준으로 관리합니다.
- Supabase REST 요청은 `lib/supabase/http.ts` 패턴을 따릅니다.
- 인증은 자체 세션 쿠키와 이메일 OTP 흐름을 기준으로 유지합니다.
- FormData 문자열 처리는 `lib/form-utils.ts`를 우선 사용합니다.
- 날짜는 `lib/date.ts`의 KST 유틸을 사용합니다.
- 권한 검증을 제거하지 않습니다.
- 자체 세션 쿠키 인증을 사용하므로 Supabase RLS의 `auth.uid()` 기반 쓰기 정책에 의존하지 않습니다.
- 작성/수정/삭제 권한은 `lib/permissions.ts`, `app/posts/actions.ts`, `app/guest/actions.ts`에서 서버 사이드로 검증합니다.
- 보호 라우트 접근 차단은 `proxy.ts`에서 수행합니다.
- posts 테이블은 RLS 활성화를 유지하되 INSERT/UPDATE/DELETE는 service_role 기반 정책으로 처리합니다.
- guest_posts 테이블은 RLS를 비활성화하고 Server Action 권한 검증을 사용합니다.
- chat_rooms/messages 테이블은 RLS를 비활성화하고 Server Component/Server Action에서 채팅방 참여자 권한을 검증합니다.
- 입력값은 trim/검증 후 저장합니다.
- Tailwind 기본 색상 직접 사용은 피하고 CSS variables를 우선 사용합니다.
- Next.js 16 기준으로 `middleware.ts` 대신 `proxy.ts`를 사용합니다.

---

## 6. Ch10 완료 반영

- `/posts` 목록이 Supabase 또는 자체 저장소(local fallback)에 연결되었습니다.
- `/posts/[id]` 상세 페이지가 저장소 데이터에 연결되었습니다.
- `/posts/new` 작성 폼이 Server Action과 `addPost()` 흐름에 연결되었습니다.
- 상세 페이지에서 작성자 또는 Owner에게만 수정/삭제 UI가 표시됩니다.
- 수정/삭제 Server Action에서도 `canManagePost()`로 권한을 재검증합니다.
- `npm run build`가 통과했습니다. 최초 실행은 Google Fonts 네트워크 fetch 실패였고, 네트워크 권한 재실행에서 성공했습니다.
- `npm run lint`가 통과했습니다.
- GitHub 원격 `origin/master`에 최신 커밋이 push된 상태입니다.
- Vercel Production 배포가 `Ready` 상태로 확인되었습니다.

---

## 7. 오늘 완료 반영

- 게시글 목록 스크롤 애니메이션을 `ScrollReveal` 컴포넌트와 Intersection Observer API로 구현했습니다.
- 내비게이션 바를 간결화했습니다.
- `PostsMenu.tsx`를 추가해 "게시글" 드롭다운에서 블로그/게스트 게시판으로 이동하도록 구성했습니다.
- role 뱃지를 제거했습니다.
- 회원관리/회원정보 링크를 제거했습니다.
- 회원가입 버튼을 제거했습니다.
- 글쓰기 버튼 텍스트를 "새 글 쓰기"로 통일했습니다.
- `/profile/[id]` 프로필 페이지를 구현했습니다.
- owner 프로필에는 블로그 게시글 목록을 표시합니다.
- member 프로필에는 게스트 게시글 목록을 표시합니다.
- nav 아바타, 게시글 작성자, 댓글 작성자에서 프로필로 진입할 수 있습니다.
- `NavMenuMobile`에 프로필 링크를 추가했습니다.
- `NavMenuMobile`에 친구 링크를 추가했습니다.
- `/profile/[id]`에 친구 요청/수락/거절/삭제 버튼을 추가했습니다.
- 환경 변수 접근을 `lib/env.ts` 기준으로 중앙화했습니다.
- `components/comment-thread.tsx`에서 직접 색상 사용을 CSS variables 기반으로 수정했습니다.

---

## 8. Ch11 RLS 완료 반영

- posts 테이블 RLS를 활성화했습니다.
- `posts_select_public` 정책으로 SELECT는 누구나 가능하도록 적용했습니다.
- `posts_insert_authenticated` 정책으로 INSERT는 로그인 사용자만 가능하고 `author_id = auth.uid()` 조건을 적용했습니다.
- `posts_update_owner` 정책으로 UPDATE는 작성자만 가능하도록 적용했습니다.
- `posts_delete_owner` 정책으로 DELETE는 작성자만 가능하도록 적용했습니다.
- 마이그레이션 파일은 `supabase/migrations/20260520041504_add_posts_rls.sql`입니다.
- `npx supabase db push`로 원격 적용이 완료되었습니다.
- 테스트 결과:
  - 비로그인 사용자는 `/posts/new` 접근 시 `/auth/login`으로 리다이렉트됩니다.
  - 사용자 A는 본인이 작성한 posts 레코드의 수정/삭제만 허용됩니다.
  - 사용자 B가 사용자 A의 posts 레코드를 수정/삭제하는 우회 시도는 실패함을 확인했습니다.
- 민감 키 grep 검사가 통과했습니다.
- 클라이언트 컴포넌트에서 service_role 키를 사용하지 않음을 확인했습니다.

---

## 9. 친구 기능 완료 반영

- `lib/friends.ts` 친구 CRUD 함수를 추가했습니다.
- `app/friends/actions.ts` 친구 기능 Server Actions를 추가했습니다.
- `/friends` 페이지를 추가했습니다.
- `/friends`에서 사용자 이름 검색 시 owner를 포함합니다.
- `/friends`에서 받은 친구 요청을 수락/거절할 수 있습니다.
- `/friends`에서 친구 목록 조회와 친구 삭제를 지원합니다.
- `/profile/[id]`에서 친구 요청/수락/거절/삭제 버튼을 제공합니다.
- `proxy.ts` 보호 라우트에 `/friends`를 추가했습니다.
- Supabase `friends` 테이블과 RLS 정책을 추가했습니다.
- 마이그레이션 파일은 `supabase/migrations/20260521055613_add_friends_table.sql`입니다.
- `lib/env.ts`에 `SUPABASE_FRIENDS_TABLE` 상수를 추가했습니다.

---

## 10. Ch13 버그 수정 및 검증 완료 반영

- posts RLS INSERT/UPDATE/DELETE 정책을 auth.uid() 기반에서 service_role 기반으로 수정했습니다.
- Supabase Auth 대신 자체 세션 쿠키를 사용해 `auth.uid()`가 null을 반환하는 구조임을 확인하고, DB 레벨 auth.uid() 기반 쓰기 정책 대신 서버 사이드 권한 검증을 기준으로 정리했습니다.
- posts_category_valid 제약 조건에 누락된 `notice` 카테고리를 추가했습니다.
- `lib/posts.ts`의 레거시 카테고리 체크 코드를 제거했습니다.
- `lib/guest-posts.ts`의 레거시 카테고리 체크 코드를 제거했습니다.
- guest_posts RLS를 비활성화했습니다.
- 서버 사이드 권한 검증 흐름은 유지합니다.
- 권한 검증 위치:
  - `lib/permissions.ts`: 권한 체크 공통 함수
  - `app/posts/actions.ts`: 블로그 Server Action 세션/권한 검증
  - `app/guest/actions.ts`: 게스트 게시판 Server Action 세션/권한 검증
  - `proxy.ts`: 보호 라우트 차단
- 추가된 마이그레이션 파일:
  - `supabase/migrations/20260526164049_fix_posts_rls.sql`
  - `supabase/migrations/20260526170435_fix_posts_category_constraint.sql`
  - `supabase/migrations/20260526173544_disable_guest_posts_rls.sql`
- Playwright E2E 테스트 2개가 통과했습니다.
- 보안 grep 3개가 통과했습니다.
- Vercel 수동 검증 5개를 완료했습니다.
- 검증 보고서: `docs/verification-report.md`

---

## 11. 라이브 채팅 완료 반영

- `lib/chat.ts`에 채팅방/메시지 타입과 CRUD 함수를 추가했습니다.
- `/chat/[roomId]` 채팅 페이지를 추가했습니다.
- `ChatWindow` Client Component에서 Supabase Realtime으로 `messages` INSERT 이벤트를 구독합니다.
- 메시지 전송은 `app/chat/[roomId]/actions.ts` Server Action에서 처리합니다.
- 친구 목록에 `FriendChatButton`을 추가해 채팅방으로 진입할 수 있습니다.
- `app/friends/actions.ts`에 `getChatRoomAction()`을 추가했습니다.
- 데스크탑/모바일 내비게이션에 로그인 사용자용 채팅 진입 링크를 추가했습니다.
- `proxy.ts` 보호 라우트에 `/chat/:path*`를 추가했습니다.
- Supabase `chat_rooms`, `messages` 테이블과 `messages` Realtime publication 등록을 마이그레이션으로 남겼습니다.
- Vercel 환경 변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 Realtime 구독에 사용합니다.

---

## 12. 미구현/보류 기능

- 팔로우 기능
- Supabase Realtime 기반 알림
- 업로드형 프로필 이미지
- E2E 테스트 CI 자동화
- 반응 테이블을 포함한 Supabase SQL 문서 최신화

---

## 13. 열린 질문

- 대댓글 depth를 현재 1단계 이상으로 확장할지 여부
- 반응 테이블 SQL 문서를 실제 운영 스키마 기준으로 정리할지 여부
- local JSON fallback을 계속 유지할지, Supabase 전용으로 단순화할지 여부
---

## 14. 최신 문서 반영: 모바일 최적화, 채팅 개선, 알림, 이미지 첨부, E2E CI

이 섹션은 기존 문서 내용을 삭제하지 않고 최신 구현 상태를 추가 기록하기 위한 보강 섹션입니다.

### UI/UX 수정

- 첨부파일 UI 하단 잘림을 수정했습니다.
- 회원정보의 나가기 버튼 동작을 홈으로 이동하도록 정리했습니다.
- 햄버거 메뉴에서 친구/채팅 진입을 통합하고 내 프로필 텍스트를 최신 표현으로 변경했습니다.
- 테마/언어 설정 토글 스타일을 최신 UI에 맞게 변경했습니다.
- BGM 정지 후 다시 클릭해도 재생되지 않던 버그를 수정했습니다.
- 모바일 뮤직 플레이어를 중앙 정렬했습니다.
- 모바일 footer 하단 여백을 조정했습니다.
- 모바일 nav 제목을 중앙 정렬했습니다.
- 모바일 버튼 텍스트 줄바꿈을 방지하도록 조정했습니다.

### 채팅 개선

- Enter 키 메시지 전송을 지원합니다.
- 채팅방 상단에 상대방 이름과 아바타를 표시합니다.
- 새 메시지 수신 시 메시지 영역이 자동 스크롤됩니다.
- 채팅 사진 전송 기능을 추가했습니다.
- 데스크탑과 모바일 모두 플로팅/최소화 전환을 지원합니다.
- 메시지 아바타는 1분 기준으로 그룹핑해 반복 표시를 줄입니다.
- 채팅창 카드 스타일은 둥근 모서리가 보이도록 조정했습니다.
- 전역 채팅 상태 관리를 위해 `ChatContext`를 사용합니다.
- 전역 플로팅 채팅 UI로 `GlobalChatWindow`를 추가했습니다.
- 뮤직 플레이어 최소화 상태와 충돌하지 않도록 `PlayerContext` 연동을 추가했습니다.
- 채팅 이미지 저장을 위한 Supabase Storage `chat-images` 버킷과 `SUPABASE_CHAT_IMAGES_BUCKET` 환경 변수를 사용합니다.
- 메시지 이미지 첨부를 위해 `messages.image_url` 컬럼을 추가했습니다.
- 관련 마이그레이션: `supabase/migrations/20260530190901_add_image_url_to_messages.sql`

### 알림 기능

- `notifications` 테이블을 추가했습니다.
- 친구 요청, 댓글, 채팅 메시지 발생 시 알림을 생성합니다.
- nav에 알림 아이콘과 안읽음 뱃지를 표시합니다.
- 알림 드롭다운 UI를 추가하고 Supabase Realtime으로 새 알림을 즉시 반영합니다.
- 모두 읽음 처리를 지원합니다.
- 티파니 블루 시그니처 컬러를 CSS variables로 추가해 안읽음 뱃지, 안읽음 점, 안읽음 배경 강조, 모두 읽음 버튼에 적용했습니다.
- 알림 테이블명은 `SUPABASE_NOTIFICATIONS_TABLE` 환경 변수 상수로 관리합니다.
- 관련 파일: `lib/notifications.ts`, `app/components/NotificationBell.tsx`, `app/components/notification-actions.ts`
- 관련 마이그레이션: `supabase/migrations/20260530205656_add_notifications_table.sql`

### 게시글 이미지 첨부

- `posts`, `guest_posts` 테이블에 `image_url` 컬럼을 추가했습니다.
- 블로그/게스트 게시글 작성과 수정 시 이미지 업로드를 지원합니다.
- 게시글 본문에서 첨부 이미지를 표시합니다.
- 게시글 이미지 저장을 위한 Supabase Storage `post-images` 버킷과 `SUPABASE_POST_IMAGES_BUCKET` 환경 변수를 사용합니다.
- 관련 마이그레이션: `supabase/migrations/20260530000000_add_image_url_to_posts.sql`

### E2E 테스트 CI 자동화

- `.github/workflows/e2e.yml`을 추가해 GitHub Actions push 시 Playwright E2E 테스트를 자동 실행합니다.
- GitHub Repository Variable `PLAYWRIGHT_BASE_URL`을 기준 URL로 사용합니다.

### 미구현/보류 항목 정정

- Supabase Realtime 기반 알림은 구현 완료 상태입니다.
- E2E 테스트 CI 자동화는 구현 완료 상태입니다.
- 업로드형 프로필 이미지는 owner/member 아바타 업로드 1차 구현이 완료되었으며, 추가 확장은 별도 개선 항목으로 관리합니다.
---

## 15. 2026-06-04 최신 완료 반영

- HTML 파일 업로드 허용: `lib/attachment-utils.ts`의 `ALLOWED_ATTACHMENT_MIME_TYPES`에 `text/html`을 추가했습니다.
- 헤더 뒤로가기 버튼 추가: `app/components/BackButton.tsx`가 신규 생성되었고, 홈(`/`)을 제외한 모든 페이지에서 `Header.tsx`의 사이트 타이틀 왼쪽에 표시됩니다.
- `BackButton`은 `usePathname()`으로 홈 여부를 판단하고 `useRouter().back()`으로 동작합니다.
- 채팅 전체모드 하단 여백 조정:
  - 모바일 기본: `bottom-14`
  - `md`/`lg`/`xl`: `bottom-[165px]`
  - `2xl` 이상: `bottom-28`
  - 아이패드 11인치 1180px는 `lg` 구간이므로 footer와 뮤직 플레이어 겹침 방지를 위해 중간 화면 여백을 유지합니다.

### Tailwind breakpoint 기준

- 기본(no prefix): 모바일, 768px 미만
- `md`: 768px 이상, 태블릿 포함
- `lg`: 1024px 이상
- `xl`: 1280px 이상
- `2xl`: 1536px 이상, 대형 데스크탑
- 아이패드 11인치 1180px는 `lg` 구간입니다.

## 16. 2026-06-04 YouTube 영상 임베드 완료 반영

- `posts`, `guest_posts` 테이블에 `youtube_url` 컬럼을 추가하는 마이그레이션을 작성했습니다.
- 마이그레이션 파일은 `supabase/migrations/20260604000000_add_youtube_url_to_posts.sql`입니다.
- 블로그/게스트 게시글 작성과 수정 화면에서 YouTube URL 입력을 지원합니다.
- 블로그/게스트 게시글 상세 화면에서 유효한 YouTube URL을 16:9 iframe으로 임베드합니다.
- `watch?v=VIDEO_ID`, `youtu.be/VIDEO_ID` 형식의 영상 ID 추출을 지원합니다.
- URL 정규화, YouTube 도메인 검증, 영상 ID 추출, 임베드 URL 생성은 `lib/attachment-utils.ts`에서 처리합니다.
- 데이터 저장과 조회 흐름은 `lib/posts.ts`, `lib/guest-posts.ts`, `app/posts/actions.ts`, `app/guest/actions.ts`에 반영했습니다.

## 17. 2026-06-04 채팅 메시지 읽음 표시 완료 반영

- `messages` 테이블에 `is_read boolean not null default false` 컬럼을 추가하는 마이그레이션을 작성했습니다.
- 마이그레이션 파일은 `supabase/migrations/20260604000001_add_is_read_to_messages.sql`입니다.
- 내가 보낸 메시지 중 상대방이 아직 읽지 않은 메시지에는 카카오톡 스타일 `1`이 표시됩니다.
- 상대방이 메시지를 읽으면 `markMessagesAsReadAction()`이 상대방이 보낸 미확인 메시지를 읽음 처리하고, Supabase Realtime UPDATE 이벤트로 내 화면의 `1` 표시가 사라집니다.
- 읽음 표시는 전체모드와 `GlobalChatWindow` 기반 플로팅 모드 모두에 적용됩니다.
- Realtime UPDATE 누락을 보정하기 위해 채팅창 열림, 브라우저 탭 포커스 복귀, 플로팅 전환 시 `getMessageReadStatusesAction()`으로 서버의 최신 `id/is_read` 상태만 다시 동기화합니다.
- 관련 구현 파일은 `lib/chat.ts`, `app/chat/[roomId]/actions.ts`, `app/components/ChatPanel.tsx`, `app/components/GlobalChatWindow.tsx`입니다.
