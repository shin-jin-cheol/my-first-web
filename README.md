# my-first-web

Next.js 16 App Router 기반의 개인 블로그 + 게스트 커뮤니티 프로젝트입니다.

## 1. 프로젝트 소개

이 프로젝트는 개인 블로그 운영과 회원 기반 게스트 커뮤니티 기능을 함께 제공하는 웹 애플리케이션입니다.

- Owner 중심 블로그 게시글 CRUD
- Member/Owner 게스트 게시판 CRUD
- 회원가입, 로그인, 계정 관리, 회원 탈퇴
- 댓글, 대댓글, 게시글/댓글 이모지 반응
- 카테고리, 검색, 파일 첨부, 링크 첨부
- 이름 기반 프로필 아바타 표시
- Supabase, Vercel Blob, 로컬 JSON fallback 저장 전략

기본 구조는 Server Component 우선이며, 이벤트 처리와 브라우저 상태가 필요한 UI에만 Client Component를 사용합니다.

## 2. 기술 스택

- Framework: Next.js 16.2.1, App Router
- UI: React 19.2.4, React DOM 19.2.4
- Language: TypeScript ^5
- Styling: Tailwind CSS ^4, CSS variables
- Lint: ESLint ^9, eslint-config-next 16.2.1
- UI Components: shadcn/ui, Radix UI, lucide-react
- Utilities: class-variance-authority, clsx, tailwind-merge, tw-animate-css
- Backend: Supabase REST/Auth/Storage
- File Storage: Supabase Storage, Vercel Blob, Local fallback
- Deployment: Vercel

상세 버전은 `package.json`을 기준으로 합니다.

## 3. 주요 기능

### 콘텐츠

- 블로그 게시글 작성/조회/수정/삭제
- 게스트 게시글 작성/조회/수정/삭제
- 카테고리 분류
- 게시글 검색
- 파일 첨부 및 링크 첨부
- KST 기준 날짜/시간 표시

### 댓글과 반응

- 블로그 게시글 댓글 작성/수정/삭제
- 게스트 게시글 댓글 작성/수정/삭제
- `parent_id` 기반 대댓글
- 게시글 이모지 반응
- 댓글 이모지 반응
- 작성자 이름 기반 이니셜/색상 아바타

### 인증/권한

- 로그인
- 이메일 인증 코드 기반 회원가입
- 회원 프로필 이름 수정
- 회원 비밀번호 변경
- 회원 탈퇴
- Owner 전용 회원 관리 페이지
- Owner/Member 권한 기반 게시글 및 댓글 관리

### 보안/안정성

- `SESSION_SECRET` 기반 세션 서명
- Owner 로그인 비밀번호 SHA-256 해시 비교
- Supabase Auth 회원 로그인 및 이메일 인증 연동
- 회원 비밀번호 정책 검증
- 환경변수 중앙화
- 안전한 JSON 파싱
- 권한 체크 공통화
- 첨부/링크 URL 정규화

### 사용자 경험

- 다크/라이트/시스템 테마 전환
- 모바일 대응 UI
- 다국어(ko/en) 라벨 처리
- BGM 플레이어
- 라이브 시계

## 4. 프로젝트 구조

```text
my-first-web/
├─ app/                         # App Router 페이지와 Server Actions
│  ├─ auth/                     # 로그인/회원가입
│  ├─ posts/                    # 블로그 목록/상세/작성/수정
│  ├─ guest/                    # 게스트 목록/상세/작성/수정/계정
│  ├─ admin/                    # 관리자 페이지
│  └─ components/               # 앱 전용 컴포넌트
├─ components/                  # 공통 컴포넌트
├─ components/ui/               # shadcn/ui 컴포넌트
├─ lib/
│  ├─ auth/                     # 인증 core/session/login/signup/account/admin
│  ├─ supabase/                 # Supabase HTTP/클라이언트 유틸
│  ├─ posts.ts                  # 블로그 저장소, 댓글, 반응 로직
│  ├─ guest-posts.ts            # 게스트 저장소, 댓글, 반응 로직
│  ├─ storage.ts                # Supabase Storage/Blob/로컬 저장 공통
│  ├─ permissions.ts            # 권한 체크
│  ├─ avatar-utils.ts           # 이름 기반 아바타 유틸
│  ├─ env.ts                    # 환경변수 중앙화
│  └─ 기타 유틸들
├─ data/                        # 로컬 JSON 데이터
├─ docs/                        # SQL/개발 문서
└─ types/                       # 공통 타입
```

## 5. 데이터 저장 구조

Supabase가 설정되어 있으면 Supabase를 우선 사용하고, 설정이 부족한 개발/레거시 상황에서는 Vercel Blob 또는 로컬 JSON fallback을 사용합니다.

### 주요 테이블

- `members`: 회원 정보, 이메일 인증 상태, Supabase Auth 사용자 연결 정보
- `posts`: 블로그 게시글
- `guest_posts`: 게스트 게시글
- `post_comments`: 블로그 댓글과 대댓글
- `guest_post_comments`: 게스트 댓글과 대댓글
- `post_reactions`: 블로그 게시글 이모지 반응
- `post_comment_reactions`: 블로그 댓글 이모지 반응
- `guest_post_reactions`: 게스트 게시글 이모지 반응
- `guest_comment_reactions`: 게스트 댓글 이모지 반응
- `storage.objects`: Supabase Storage 첨부 파일

## 6. 환경변수 목록

`lib/env.ts`에서 중앙 관리하는 값과 일부 Next.js/Supabase 클라이언트에서 직접 참조하는 값입니다.

### Supabase

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Supabase 테이블/버킷 옵션

- `SUPABASE_MEMBERS_TABLE` (default: `members`)
- `SUPABASE_POSTS_TABLE` (default: `posts`)
- `SUPABASE_GUEST_POSTS_TABLE` (default: `guest_posts`)
- `SUPABASE_POST_COMMENTS_TABLE` (default: `post_comments`)
- `SUPABASE_GUEST_POST_COMMENTS_TABLE` (default: `guest_post_comments`)
- `SUPABASE_UPLOADS_BUCKET` (default: `uploads`)

### 파일/세션/운영

- `BLOB_READ_WRITE_TOKEN`
- `SESSION_SECRET`
- `OWNER_ID`
- `OWNER_PASSWORD`
- `OWNER_NAME`
- `NODE_ENV`
- `VERCEL`

`OWNER_PASSWORD`는 Owner 로그인에서 입력 비밀번호를 SHA-256으로 해시한 값과 비교합니다.

## 7. 로컬 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

3. 빌드

```bash
npm run build
```

4. 린트

```bash
npm run lint
```

Windows PowerShell에서 실행 정책 이슈가 있으면 다음 형식을 사용합니다.

```bash
cmd /c npm run build
cmd /c npm run lint
```

## 8. 배포 정보

- 배포 플랫폼: Vercel
- 기본 배포 브랜치: `master`
- 배포 명령 예시:

```bash
npx vercel --prod
```

- 현재 README에 기재되어 있는 배포 주소:
  - https://my-first-web-ten-phi.vercel.app

## 9. 개발 과정에서 적용한 것들

### 보안/안정성

- 환경변수 접근 중앙화(`lib/env.ts`)
- 세션 서명 유틸(`lib/auth/session.ts`)
- Supabase Auth 연동(`lib/auth/core.ts`)
- Owner 비밀번호 해시 비교(`lib/auth/login.ts`)
- 안전한 JSON 파싱 유틸(`lib/safe-json.ts`)
- redirect 에러 처리 유틸(`lib/redirect-error.ts`)
- 권한 체크 공통화(`lib/permissions.ts`)
- URL/첨부 관련 정규화 유틸(`lib/attachment-utils.ts`)

### 코드 구조 개선

- 인증 로직 모듈 분리(`lib/auth/*`)
- Server Actions 분리(`app/auth/actions.ts`, `app/posts/actions.ts`, `app/guest/actions.ts`)
- 게시글/댓글/반응 저장소 로직 분리(`lib/posts.ts`, `lib/guest-posts.ts`)
- 카테고리/첨부/검색/댓글 조회 중복 로직 유틸화
- 공통 타입 분리(`types/posts.ts`)

### 운영 관점

- Server Component 우선 구조 유지
- Supabase 우선 + Blob/로컬 fallback 저장 전략
- 데이터 변경 후 `revalidatePath` 기반 화면 동기화

### 참고 문서

- `docs/refactoring-summary.md`
- `docs/supabase-members.sql`
- `docs/supabase-content.sql`
- `docs/supabase-board-stability.sql`
