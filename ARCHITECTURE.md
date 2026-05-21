# Architecture

## 1. 개요

이 프로젝트는 개인 블로그와 회원 기반 게스트 커뮤니티 기능을 함께 제공하는 Next.js 애플리케이션입니다.

- Frontend: Next.js 16.2.1 App Router, React 19.2.4
- Styling: Tailwind CSS 4, CSS variables, shadcn/ui
- Backend: Supabase HTTP client pattern
- Auth: 자체 세션 쿠키 + 이메일 OTP
- File Storage: Supabase Storage, Vercel Blob, local fallback
- Deployment: Vercel

기본 방향은 Server Component 우선 구조입니다. 상태, 이벤트 핸들러, 브라우저 API가 필요한 UI만 Client Component로 분리합니다.

---

## 2. Routes (App Router)

- `/`: 홈, 최신 글 목록
- `/posts`: 블로그 목록
- `/posts/[id]`: 블로그 상세, 댓글, 대댓글, 이모지 반응
- `/posts/new`: 블로그 작성
- `/posts/[id]/edit`: 블로그 수정
- `/guest`: 게스트 게시판 목록
- `/guest/[id]`: 게스트 게시글 상세, 댓글, 대댓글, 이모지 반응
- `/guest/new`: 게스트 글 작성
- `/guest/[id]/edit`: 게스트 글 수정
- `/guest/account`: 회원 프로필 수정, 비밀번호 변경, 회원 탈퇴
- `/friends`: 친구 검색, 받은 친구 요청 수락/거절, 친구 목록과 삭제
- `/profile/[id]`: 공개 프로필. owner는 블로그 게시글 목록, member는 게스트 게시글 목록 표시
- `/auth/login`: 로그인
- `/auth/signup`: 이메일 OTP 기반 회원가입
- `/admin/members`: Owner 전용 회원 관리

서버 동작은 App Router와 Server Actions로 처리하며, 이동은 `redirect`, 화면 동기화는 `revalidatePath`를 사용합니다.

---

## 3. 보호 라우트

Next.js 16 기준으로 `middleware.ts`를 사용하지 않고 루트의 `proxy.ts`를 사용합니다.

`proxy.ts`는 `sjc-session` 자체 세션 쿠키를 확인합니다. 세션 쿠키가 없으면 아래 보호 라우트 접근 시 `/auth/login`으로 리다이렉트합니다.

- `/posts/new`
- `/guest/new`
- `/guest/account`
- `/friends`
- `/admin/:path*`

`export const config`의 matcher 설정으로 보호 라우트를 제한합니다.

---

## 4. 주요 모듈

### Layout/UI

- `app/layout.tsx`: 루트 레이아웃, Next font, 전역 메타데이터
- `app/components/ClientLayout.tsx`: 클라이언트 전용 전역 UI wrapper
- `app/components/Header.tsx`: 내비게이션
- `app/components/PostsMenu.tsx`: "게시글" 드롭다운 메뉴. 블로그와 게스트 게시판 링크 제공
- `app/components/NavMenuMobile.tsx`: 모바일 내비게이션. 프로필 링크와 친구 링크 포함
- `app/components/ScrollReveal.tsx`: Intersection Observer API 기반 스크롤 등장 애니메이션
- `app/components/ThemeProvider.tsx`, `ThemeToggle.tsx`: 테마 전환
- `app/components/BgmPlayer.tsx`: BGM 플레이어
- `app/components/LiveClock.tsx`: 라이브 시계
- `components/ui/*`: shadcn/ui 기반 UI 컴포넌트

### Posts

- `lib/posts.ts`: 블로그 게시글, 댓글, 대댓글, 반응 저장소 로직
- `app/posts/actions.ts`: 블로그 Server Actions
- `app/components/PostsSearchContent.tsx`: 블로그 검색 UI
- `components/post-reaction.tsx`: 게시글 반응 UI
- `components/comment-thread.tsx`: 댓글/대댓글/댓글 반응 UI

### Guest

- `lib/guest-posts.ts`: 게스트 게시글, 댓글, 대댓글, 반응 저장소 로직
- `app/guest/actions.ts`: 게스트 게시판 Server Actions
- `app/components/GuestPostsSearchList.tsx`: 게스트 게시글 검색 UI

### Profile

- `app/profile/[id]/page.tsx`: 공개 프로필 페이지
- owner 프로필은 블로그 게시글 목록을 표시합니다.
- member 프로필은 게스트 게시글 목록을 표시합니다.
- 진입 경로는 nav 아바타, 게시글 작성자 링크, 댓글 작성자 링크입니다.
- 프로필 페이지에서 친구 요청, 수락, 거절, 삭제 버튼을 제공합니다.

### Friends

- `lib/friends.ts`: 친구 요청 생성, 조회, 수락, 거절, 삭제 저장소 로직
- `app/friends/actions.ts`: 친구 기능 Server Actions
- `app/friends/page.tsx`: 사용자 이름 검색, 받은 친구 요청 처리, 친구 목록 관리 페이지
- 친구 검색은 owner 계정을 포함합니다.
- 친구 기능은 `proxy.ts` 보호 라우트와 자체 세션 쿠키 인증을 기준으로 접근을 제한합니다.

### Auth

- `lib/auth/core.ts`: 회원 저장소, 회원 정규화, 공통 인증 로직
- `lib/auth/login.ts`: 로그인 및 Owner 비밀번호 해시 비교
- `lib/auth/signup.ts`: 이메일 OTP 기반 회원가입
- `lib/auth/session.ts`: 자체 세션 서명/쿠키 처리
- `lib/auth/account.ts`: 프로필 수정, 비밀번호 변경, 회원 탈퇴
- `lib/auth/admin.ts`: Owner용 회원 조회
- `app/auth/actions.ts`: 인증 Server Actions
- `proxy.ts`: 보호 라우트 세션 쿠키 확인 및 로그인 리다이렉트

### Shared Utilities

- `lib/env.ts`: 환경 변수 중앙화. `NODE_ENV`, `IS_VERCEL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_FRIENDS_TABLE` 포함
- `lib/storage.ts`: Supabase Storage, Vercel Blob, local file fallback
- `lib/supabase/http.ts`: Supabase REST 공통 요청
- `lib/supabase/client.ts`: Supabase client 생성
- `lib/permissions.ts`: 게시글/댓글 관리 권한
- `lib/date.ts`: KST 날짜/시간
- `lib/form-utils.ts`: FormData 문자열/숫자 처리
- `lib/attachment-utils.ts`: 링크/첨부 정규화
- `lib/avatar-utils.ts`: 이름 기반 아바타 색상/문자 생성
- `lib/safe-json.ts`: 안전한 JSON 파싱

---

## 5. 데이터 흐름

1. 사용자가 폼 제출 또는 반응 버튼 클릭
2. 보호 라우트는 `proxy.ts`에서 자체 세션 쿠키를 먼저 확인
3. Server Action에서 세션, 권한, 입력값 검증
4. `lib/posts.ts`, `lib/guest-posts.ts`, `lib/friends.ts`, `lib/auth/*` 저장소 함수 호출
5. Supabase 사용 가능 시 Supabase HTTP/Storage 요청
6. Supabase 또는 Blob 설정이 부족한 환경에서는 기존 local fallback 흐름 사용
7. 변경 성공 후 `revalidatePath`와 `redirect`로 화면 갱신

---

## 6. 데이터 모델

### members

- `id` (PK)
- `name`
- `password`
- `email`
- `email_verified`
- `created_at`

회원 인증은 Supabase Auth가 아니라 자체 세션 쿠키와 이메일 OTP 흐름을 기준으로 합니다. Owner 계정은 `OWNER_PASSWORD` 해시값과 입력 비밀번호의 SHA-256 해시를 비교합니다.

### posts

- `id` (PK)
- `title`
- `content`
- `author`
- `author_id`
- `category`
- `date`
- `link_url`
- `file_url`
- `file_name`
- `views`

posts 테이블은 Ch11에서 RLS를 활성화했습니다. 적용 정책은 `posts_select_public`(SELECT 누구나 가능), `posts_insert_authenticated`(INSERT 로그인 사용자만 가능, `author_id = auth.uid()`), `posts_update_owner`(UPDATE 작성자만 가능), `posts_delete_owner`(DELETE 작성자만 가능)입니다.

### guest_posts

- `id` (PK)
- `title`
- `content`
- `author_id`
- `author_name`
- `category`
- `date`
- `link_url`
- `file_url`
- `file_name`
- `views`
- `comments` (legacy 호환용 JSONB)

### post_comments

- `id` (PK)
- `post_id`
- `author_id`
- `author_name`
- `content`
- `date_time`
- `parent_id`

`parent_id`가 없으면 최상위 댓글이고, 값이 있으면 해당 댓글의 대댓글입니다.

### guest_post_comments

- `id` (PK)
- `guest_post_id`
- `author_id`
- `author_name`
- `content`
- `created_at`
- `parent_id`

`parent_id` 구조는 블로그 댓글과 동일합니다.

### reactions

- `post_reactions`
- `post_comment_reactions`
- `guest_post_reactions`
- `guest_comment_reactions`

각 반응 테이블은 대상 id, `member_id`, `emoji`, 생성 시각을 저장합니다.

### friends

- `id` (PK)
- `requester_id`
- `requester_name`
- `receiver_id`
- `receiver_name`
- `status`
- `created_at`
- `updated_at`

friends 테이블은 친구 요청과 친구 관계를 저장합니다. `status`는 요청 대기, 수락 등 관계 상태를 표현하며, RLS 정책은 로그인 사용자 본인이 요청자 또는 수신자인 친구 레코드만 생성/조회/변경/삭제할 수 있도록 제한합니다.

---

## 7. 저장 전략

- 게시글/댓글/반응: Supabase REST 우선, local JSON fallback 유지
- 첨부 파일: Supabase Storage 우선, Vercel Blob 또는 local fallback
- 회원: 자체 회원 저장소와 세션 쿠키 흐름 유지
- 친구: Supabase REST 우선, 자체 세션 쿠키와 RLS 기반 권한 강제
- 환경 변수: `lib/env.ts`에서 중앙 관리

---

## 8. 권한 모델

- Owner: 블로그/게스트 게시글과 댓글 관리 가능, 회원 관리 페이지 접근 가능
- Member: 본인이 작성한 게스트 게시글과 댓글 관리 가능
- 비회원: 공개 목록/상세 조회 중심, 보호 라우트 접근 시 `/auth/login`으로 이동
- 게시글/댓글 관리 권한은 `lib/permissions.ts`에서 공통 처리
- 친구 관계 관리는 `lib/friends.ts`와 friends 테이블 RLS 정책으로 요청자/수신자 기준 권한을 강제
- UI 분기는 작성자에게만 수정/삭제 버튼을 보여 주는 UX 계층입니다.
- DB 보안은 클라이언트 조건문이 아니라 Supabase RLS로 강제합니다.
- posts 테이블 보호 정책:
  - `posts_select_public`: SELECT 누구나 가능
  - `posts_insert_authenticated`: INSERT 로그인 사용자만 가능, `author_id = auth.uid()`
  - `posts_update_owner`: UPDATE 작성자만 가능
  - `posts_delete_owner`: DELETE 작성자만 가능

---

## 9. 구현 완료 기능

- 블로그 게시글 CRUD
- `/posts` 목록 Supabase 또는 local fallback 연결
- `/posts/[id]` 상세 연결
- `/posts/new` 작성 연결
- 작성자에게만 수정/삭제 UI 표시
- 게스트 게시글 CRUD
- 댓글 CRUD
- `parent_id` 기반 대댓글
- 게시글/댓글 이모지 반응
- 자체 세션 쿠키 기반 로그인
- 이메일 OTP 흐름
- `proxy.ts` 보호 라우트
- 비로그인 사용자 `/auth/login` 리다이렉트
- 회원 프로필 수정
- 회원 비밀번호 변경
- 회원 탈퇴
- Owner 회원 관리
- 공개 프로필 페이지 `/profile/[id]`
- 친구 기능
- `/friends` 친구 검색/요청 관리/친구 목록 페이지
- `/profile/[id]` 친구 요청/수락/거절/삭제 버튼
- `lib/friends.ts` 친구 CRUD 함수
- `app/friends/actions.ts` 친구 Server Actions
- `NavMenuMobile.tsx` 친구 링크
- `proxy.ts` `/friends` 보호 라우트
- friends 테이블 RLS 활성화
- `supabase/migrations/20260521055613_add_friends_table.sql` 마이그레이션 작성
- `lib/env.ts` `SUPABASE_FRIENDS_TABLE` 상수 추가
- 검색
- 파일/링크 첨부
- 테마 전환
- 이름 기반 아바타
- 게시글 목록 스크롤 애니메이션
- 간결화된 내비게이션과 `PostsMenu.tsx`
- `.agent/rules/project.md` 생성
- Next.js 16 기준 `middleware.ts` 제거 및 `proxy.ts` 전환
- 환경 변수 중앙화와 CSS variables 규칙 위반 수정
- posts 테이블 RLS 활성화
- `posts_select_public`, `posts_insert_authenticated`, `posts_update_owner`, `posts_delete_owner` 정책 적용
- `supabase/migrations/20260520041504_add_posts_rls.sql` 마이그레이션 작성 및 `npx supabase db push` 원격 적용 완료
- 브라우저 우회 테스트로 다른 계정의 수정/삭제 실패 확인
- 민감 키 grep 검사 통과
- 클라이언트 컴포넌트에서 service_role 키 미사용 확인
- `npm run build` 통과
- GitHub push 완료
- Vercel Production 배포 완료

---

## 10. 미구현 기능

- 실시간 채팅
- 팔로우 기능
- Supabase Realtime 기반 알림
- 업로드형 프로필 이미지
- E2E 테스트
- 반응 테이블을 포함한 Supabase SQL 문서 최신화

---

## 11. 설계 원칙

- App Router만 사용
- Server Component 우선
- Server Action 흐름 유지
- 환경 변수는 `lib/env.ts` 기준
- Supabase HTTP 요청은 `lib/supabase/http.ts` 패턴 사용
- 인증은 자체 세션 쿠키 + 이메일 OTP 구조 유지
- Next.js 16 기준 `proxy.ts` 사용
- 입력값과 권한 검증 제거 금지
- Tailwind 기본 색상 직접 사용 지양, CSS variables 우선
