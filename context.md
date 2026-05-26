# Context

## 1. 프로젝트 개요

개인 블로그와 회원 기반 게스트 커뮤니티를 함께 제공하는 Next.js 애플리케이션입니다.

- Owner는 블로그 게시글을 운영합니다.
- Member는 게스트 게시판에 글을 작성하고 댓글/반응으로 참여합니다.
- 로그인 사용자는 친구 요청을 보내고, 받은 요청을 수락/거절하며, 친구 목록을 관리할 수 있습니다.
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
- `/admin/:path*`

비로그인 사용자는 보호 라우트 접근 시 `/auth/login`으로 리다이렉트됩니다.

### 프로필

- `/profile/[id]` 공개 프로필 페이지
- owner 프로필에서는 블로그 게시글 목록 표시
- member 프로필에서는 게스트 게시글 목록 표시
- 진입 경로: nav 아바타, 게시글 작성자, 댓글 작성자
- 모바일 내비게이션(`NavMenuMobile`)에 프로필 링크 추가
- 모바일 내비게이션(`NavMenuMobile`)에 친구 링크 추가

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
- `lib/env.ts`에 `SUPABASE_FRIENDS_TABLE` 추가
- `lib/auth/session.ts`, `lib/storage.ts`, `lib/supabase/client.ts`, `app/layout.tsx`의 환경 변수 접근을 `lib/env.ts` 기준으로 중앙화
- `components/comment-thread.tsx`의 `text-white`를 `text-[var(--surface)]`로 수정

---

## 4. 주요 데이터 구조

- `members`
- `posts`
- `guest_posts`
- `post_comments`
- `guest_post_comments`
- `post_reactions`
- `post_comment_reactions`
- `guest_post_reactions`
- `guest_comment_reactions`
- `friends`
- Supabase Storage `uploads` bucket
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

## 11. 미구현/보류 기능

- 실시간 채팅
- 팔로우 기능
- Supabase Realtime 기반 알림
- 업로드형 프로필 이미지
- E2E 테스트 CI 자동화
- 반응 테이블을 포함한 Supabase SQL 문서 최신화

---

## 12. 열린 질문

- 대댓글 depth를 현재 1단계 이상으로 확장할지 여부
- 반응 테이블 SQL 문서를 실제 운영 스키마 기준으로 정리할지 여부
- local JSON fallback을 계속 유지할지, Supabase 전용으로 단순화할지 여부
