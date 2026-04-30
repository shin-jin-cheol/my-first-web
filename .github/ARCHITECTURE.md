# Architecture

## Overview

이 프로젝트는 개인 블로그 + 커뮤니티 기능을 포함한 웹 서비스이다.

* Frontend: Next.js
* Backend: Supabase
* Deployment: Vercel

---

## Routes (App Router)

이 저장소는 Next.js App Router 구조를 따릅니다. 주요 라우트는 다음과 같습니다:

- `/` : 홈 / 최신 글 목록
- `/posts` : 블로그 목록
- `/posts/[id]` : 블로그 상세
- `/posts/new` : 블로그 작성 (Server Action)
- `/posts/[id]/edit` : 블로그 수정 (Server Action)
- `/guest` : 게스트 포스트 목록
- `/guest/[id]` : 게스트 포스트 상세
- `/guest/new` : 게스트 글 작성 (Server Action)
- `/guest/[id]/edit` : 게스트 글 수정 (Server Action)
- `/auth/login` and `/auth/signup` : 인증 플로우
- `/admin/members` : 관리자 멤버 목록 (owner 전용)
- `/api/gemini` : 서버사이드 API 프록시

---

## Component Structure

### Layout

루트 레이아웃은 Server Component로 작성되며 클라이언트 전용 UI는 `app/components/ClientLayout.tsx` 등의 client 래퍼로 감쌉니다. 전역 스타일은 `app/globals.css`에 정의되어 있습니다.

### Post

* PostCard
* PostDetail
* PostEditor

### Comment

* CommentList
* CommentItem
* CommentForm

### Comments & Storage

댓글과 게시글 저장은 다음 전략을 혼합 사용합니다:
- Supabase: 선택적(환경변수에 따라 활성화)
- 로컬 JSON 파일: 레거시/개발용
- Vercel Blob: 파일 업로드/첨부

저장소 추상화는 `lib/posts.ts` 및 `lib/guest-posts.ts`에서 관리됩니다. 서버 동작은 Server Actions를 통해 수행됩니다.

---

## Data Flow

1. 사용자가 글 작성
2. Frontend → Supabase API 요청
3. DB 저장
4. 결과 반환 후 UI 업데이트

---

## Data Models

### posts

* id (PK)
* title
* content
* author
* author_id
* category
* file_url
* link_url
* created_at

### comments (planned)

* id
* post_id
* user_id
* content
* parent_id (대댓글)

### users

* id
* username
* avatar_url

### friends (planned)

* id
* user_id
* friend_id

---

## Realtime

* Supabase Realtime 사용
* 채팅 및 알림 처리

---

## Design Principles

* 단순하게 시작 → 점진적 확장
* 프론트 중심 구조
* 서버 로직 최소화
