# Architecture

## 1. 개요

이 프로젝트는 개인 블로그와 회원 기반 게스트 커뮤니티 기능을 포함한 Next.js 웹 애플리케이션입니다.

- Frontend: Next.js 16.2.1 App Router, React 19.2.4
- Styling: Tailwind CSS 4, CSS variables, shadcn/ui
- Backend: Supabase REST/Auth/Storage
- File Storage: Supabase Storage, Vercel Blob, Local fallback
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
- `/auth/login`: 로그인
- `/auth/signup`: 이메일 인증 코드 기반 회원가입
- `/admin/members`: Owner 전용 회원 관리

서버 동작은 App Router의 Server Actions로 처리하며, 이동은 `redirect`, 화면 동기화는 `revalidatePath`를 사용합니다.

---

## 3. 주요 모듈

### Layout/UI

- `app/layout.tsx`: 루트 레이아웃
- `app/components/ClientLayout.tsx`: 클라이언트 전용 전역 UI 래퍼
- `app/components/Header.tsx`: 네비게이션
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

### Auth

- `lib/auth/core.ts`: 회원 저장소, Supabase Auth 요청, 회원 정규화
- `lib/auth/login.ts`: 로그인 및 Owner 비밀번호 해시 비교
- `lib/auth/signup.ts`: 이메일 인증 코드 회원가입
- `lib/auth/session.ts`: 세션 서명/쿠키 처리
- `lib/auth/account.ts`: 프로필 수정, 비밀번호 변경, 회원 탈퇴
- `lib/auth/admin.ts`: Owner용 회원 조회
- `app/auth/actions.ts`: 인증 Server Actions

### Shared Utilities

- `lib/env.ts`: 환경변수 중앙화
- `lib/storage.ts`: Supabase Storage, Vercel Blob, 로컬 파일 fallback
- `lib/supabase/http.ts`: Supabase REST 공통 요청
- `lib/permissions.ts`: 게시글/댓글 관리 권한
- `lib/date.ts`: KST 날짜/시간
- `lib/form-utils.ts`: FormData 문자열 처리
- `lib/attachment-utils.ts`: 링크/첨부 정규화
- `lib/avatar-utils.ts`: 이름 기반 아바타 색상/문자 생성
- `lib/safe-json.ts`: 안전한 JSON 파싱

---

## 4. 데이터 흐름

1. 사용자가 폼 제출 또는 반응 버튼 클릭
2. Server Action에서 세션, 권한, 입력값 검증
3. `lib/posts.ts`, `lib/guest-posts.ts`, `lib/auth/*` 저장소 함수 호출
4. Supabase 사용 가능 시 Supabase REST/Auth/Storage 요청
5. Supabase 설정이 부족하면 Vercel Blob 또는 로컬 JSON fallback 사용
6. 변경 성공 후 `revalidatePath`와 `redirect`로 화면 갱신

---

## 5. 데이터 모델

### members

- `id` (PK)
- `name`
- `password`
- `email`
- `email_verified`
- `auth_user_id`
- `created_at`

회원 비밀번호는 Supabase Auth 사용 시 Auth API로 검증하고, 로컬/레거시 fallback에서는 기존 `password` 필드를 사용합니다. Owner 계정은 `OWNER_PASSWORD` 해시값과 입력 비밀번호 해시를 비교합니다.

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
- `comments` (레거시 호환용 JSONB)

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

### post_reactions

- `id` (PK)
- `post_id`
- `member_id`
- `emoji`
- `created_at`

### post_comment_reactions

- `id` (PK)
- `comment_id`
- `member_id`
- `emoji`
- `created_at`

### guest_post_reactions

- `id` (PK)
- `guest_post_id`
- `member_id`
- `emoji`
- `created_at`

### guest_comment_reactions

- `id` (PK)
- `comment_id`
- `member_id`
- `emoji`
- `created_at`

---

## 6. 저장 전략

- 게시글/댓글/반응: Supabase REST 우선, 레거시/개발 환경에서는 JSON fallback
- 첨부 파일: Supabase Storage 우선, Vercel Blob 또는 로컬 fallback
- 회원: Supabase 테이블/Auth 우선, 레거시 저장소 fallback
- 환경변수: `lib/env.ts`에서 중앙 관리

---

## 7. 권한 모델

- Owner: 블로그/게스트 게시글과 댓글 관리 가능, 회원 관리 페이지 접근 가능
- Member: 본인이 작성한 게스트 게시글과 댓글 관리 가능
- 비회원: 공개 목록/상세 조회 중심
- 게시글/댓글 관리 권한은 `lib/permissions.ts`에서 공통 처리

---

## 8. 구현 완료 기능

- 블로그 게시글 CRUD
- 게스트 게시글 CRUD
- 댓글 CRUD
- `parent_id` 기반 대댓글
- 게시글/댓글 이모지 반응
- 로그인/회원가입/세션
- 이메일 인증 코드 흐름
- 회원 프로필 수정
- 회원 비밀번호 변경
- 회원 탈퇴
- Owner 회원 관리
- 검색
- 파일/링크 첨부
- 테마 전환
- 이름 기반 아바타

---

## 9. 미구현 기능

- 실시간 채팅
- 친구/팔로우 기능
- Supabase Realtime 기반 알림
- 업로드형 프로필 이미지

---

## 10. 설계 원칙

- App Router만 사용
- Server Component 우선
- Server Action 흐름 유지
- 환경변수는 `lib/env.ts` 기준
- Supabase HTTP 요청은 `lib/supabase/http.ts` 패턴 사용
- 입력값과 권한 검증 제거 금지
- Tailwind 기본 색상 직접 사용 대신 CSS variables 우선
