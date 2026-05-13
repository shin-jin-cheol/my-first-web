# Context

## 1. 프로젝트 개요

개인 블로그와 회원 기반 게스트 커뮤니티를 함께 제공하는 Next.js 애플리케이션입니다.

- Owner는 블로그 게시글을 운영합니다.
- Member는 게스트 게시판에 글을 작성하고 댓글/반응으로 참여합니다.
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
- 카테고리 분류
- 검색
- 파일 첨부
- 링크 첨부
- KST 날짜/시간 처리

### 댓글/반응

- 블로그 댓글 CRUD
- 게스트 댓글 CRUD
- `parent_id` 기반 대댓글
- 게시글 이모지 반응
- 댓글 이모지 반응
- 이름 기반 댓글 아바타

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

보호 라우트:

- `/posts/new`
- `/guest/new`
- `/guest/account`
- `/admin/:path*`

비로그인 사용자는 보호 라우트 접근 시 `/auth/login`으로 리다이렉트됩니다.

### UI/UX

- 다크/라이트 시스템 테마
- 모바일 대응 네비게이션
- 다국어(ko/en) 텍스트 처리
- BGM 플레이어
- 라이브 시계
- shadcn/ui 기반 Button/Input/Dialog 등

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
- Supabase Storage `uploads` bucket
- local fallback JSON data

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
- 입력값은 trim/검증 후 저장합니다.
- Tailwind 기본 색상 직접 사용은 피하고 CSS variables를 우선 사용합니다.
- Next.js 16 기준으로 `middleware.ts` 대신 `proxy.ts`를 사용합니다.

---

## 6. Ch9 완료 반영

- `proxy.ts`로 보호 라우트가 추가되었습니다.
- 비로그인 사용자는 `/auth/login`으로 리다이렉트됩니다.
- Next.js 16 기준 deprecated된 `middleware.ts`를 제거하고 `proxy.ts`로 변경했습니다.
- `.agent/rules/project.md` 생성이 완료되었습니다.

---

## 7. 미구현/보류 기능

- 실시간 채팅
- 친구/팔로우 기능
- Supabase Realtime 기반 알림
- 업로드형 프로필 이미지
- E2E 테스트

---

## 8. 열린 질문

- 대댓글 depth를 현재 1단계 이상으로 확장할지 여부
- 반응 테이블 SQL 문서를 실제 운영 스키마 기준으로 정리할지 여부
- local JSON fallback을 계속 유지할지, Supabase 전용으로 단순화할지 여부
