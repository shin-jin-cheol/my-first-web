# my-first-web

Next.js 16 App Router 기반의 개인 블로그 + 게스트 커뮤니티 프로젝트입니다.

## 1) 프로젝트 소개

이 프로젝트는 다음 목적을 가진 웹 애플리케이션입니다.

- 블로그 게시글 운영(Owner 중심)
- 게스트 게시판 운영(Member/Owner)
- 회원 인증 및 계정 관리
- 댓글 기반 상호작용
- Supabase / Vercel Blob / 로컬 JSON fallback 저장 전략

현재 구조는 서버 중심(Server Component 우선)으로 구성되어 있으며, 필요한 경우에만 Client Component를 사용합니다.

## 2) 기술 스택 (실제 사용 버전 기준)

- Next.js: 16.2.1
- React / React DOM: 19.2.4
- TypeScript: ^5
- Tailwind CSS: ^4
- ESLint: ^9
- eslint-config-next: 16.2.1
- UI: shadcn/ui, Radix UI, lucide-react
- 유틸: class-variance-authority, clsx, tailwind-merge, tw-animate-css
- 백엔드 연동: @supabase/ssr, @supabase/supabase-js
- 파일 저장: @vercel/blob

상세 버전은 package.json 기준입니다.

## 3) 주요 기능

### 콘텐츠

- 블로그 게시글 CRUD
- 게스트 게시글 CRUD
- 카테고리 분류
- 파일 첨부 / 링크 첨부
- 댓글 작성/수정/삭제

### 인증/권한

- 로그인 / 회원가입(이메일 인증 코드 흐름 포함)
- 회원 프로필 수정
- 회원 비밀번호 변경
- 회원 탈퇴
- Owner 전용 회원 관리 페이지

### 사용자 경험

- 다크/라이트/시스템 테마 전환
- 모바일 대응 UI
- 다국어(ko/en) 라벨 처리
- BGM 플레이어
- 라이브 시계

## 4) 프로젝트 구조

```text
my-first-web/
├─ app/                         # App Router
│  ├─ auth/                     # 로그인/회원가입 + 서버 액션
│  ├─ posts/                    # 블로그 목록/상세/작성/수정
│  ├─ guest/                    # 게스트 목록/상세/작성/수정/계정
│  ├─ admin/                    # 관리자 페이지
│  └─ components/               # 앱 전용 컴포넌트
├─ components/ui/               # shadcn/ui 컴포넌트
├─ lib/
│  ├─ auth/                     # auth 모듈 분리(core/session/login/signup/...)
│  ├─ supabase/                 # Supabase HTTP/클라이언트 유틸
│  ├─ posts.ts                  # 블로그 저장소 로직
│  ├─ guest-posts.ts            # 게스트 저장소 로직
│  ├─ storage.ts                # Blob/로컬 저장 공통
│  ├─ permissions.ts            # 권한 체크
│  ├─ env.ts                    # 환경변수 중앙화
│  └─ 기타 유틸들
├─ data/                        # 로컬 JSON 데이터
├─ docs/                        # SQL/개발 문서
└─ types/                       # 공통 타입
```

## 5) 환경변수 목록

lib/env.ts 중앙 관리 환경변수와 
일부 직접 process.env로 사용하는 환경변수 목록입니다.

### Supabase

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_SUPABASE_URL

### Supabase 테이블/버킷(옵션)

- SUPABASE_MEMBERS_TABLE (default: members)
- SUPABASE_POSTS_TABLE (default: posts)
- SUPABASE_GUEST_POSTS_TABLE (default: guest_posts)
- SUPABASE_POST_COMMENTS_TABLE (default: post_comments)
- SUPABASE_GUEST_POST_COMMENTS_TABLE (default: guest_post_comments)
- SUPABASE_UPLOADS_BUCKET (default: uploads)

### 파일/세션/운영

- BLOB_READ_WRITE_TOKEN
- SESSION_SECRET
- OWNER_ID
- OWNER_PASSWORD
- OWNER_NAME
- NODE_ENV
- VERCEL

## 6) 로컬 실행 방법

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

## 7) 배포 정보

- 배포 플랫폼: Vercel
- 기본 배포 브랜치: master
- 배포 명령 예시:

```bash
npx vercel --prod
```

- 현재 README에 기재되어 있는 배포 주소:
  - https://my-first-web-ten-phi.vercel.app

## 8) 개발 과정에서 적용한 것들

### 보안/안정성

- 환경변수 접근 중앙화(lib/env.ts)
- 안전한 JSON 파싱 유틸 적용(lib/safe-json.ts)
- redirect 에러 처리 유틸화(lib/redirect-error.ts)
- 권한 체크 공통화(lib/permissions.ts)
- URL/첨부 관련 정규화 유틸 사용(lib/attachment-utils.ts)

### 코드 구조 개선

- 인증 로직 모듈 분리(lib/auth/*)
- 서버 액션 공통화(app/auth/actions.ts)
- 중복 로직 유틸화(카테고리/첨부/검색/댓글 조회)
- 타입 분리(types/posts.ts)

### 성능/운영 관점

- Server Component 우선 구조 유지
- 저장소 fallback 전략 운영(Supabase 우선 + Blob/로컬)
- 데이터 변경 후 revalidatePath 기반 화면 동기화

### 참고 문서

- docs/refactoring-summary.md
- docs/supabase-members.sql
- docs/supabase-content.sql
- docs/supabase-board-stability.sql
