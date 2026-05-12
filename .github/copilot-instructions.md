# Copilot Instructions

이 문서는 GitHub Copilot/AI Agent가 이 프로젝트에서 실제 코드 기준에 맞는 변경을 만들도록 돕는 규칙입니다.

---

## 기술 스택

- Next.js 16.2.1, App Router only
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- shadcn/ui under `components/ui/`
- Radix UI, lucide-react
- Supabase REST/Auth/Storage
- Vercel Blob
- ESLint 9, eslint-config-next 16.2.1

상세 버전은 항상 `package.json`을 기준으로 확인합니다.

---

## 앱 구조

- `app/`: App Router 페이지, 레이아웃, Server Actions
- `app/components/`: 앱 전용 컴포넌트
- `components/`: 공통 컴포넌트
- `components/ui/`: shadcn/ui 컴포넌트
- `lib/`: 저장소, 인증, Supabase, 권한, 날짜, 폼, 첨부 유틸
- `lib/auth/`: 인증 core/session/login/signup/account/admin
- `lib/supabase/`: Supabase HTTP/클라이언트 유틸
- `types/`: 공통 타입
- `docs/`: SQL/개발 문서

Pages Router용 `pages/` 디렉터리와 API를 사용하지 않습니다.

---

## 코딩 규칙

- 기본은 Server Component입니다.
- `"use client"`는 상태, 이벤트 핸들러, 브라우저 API가 필요한 경우에만 추가합니다.
- 데이터 처리와 Server Actions는 `async/await` 기반으로 작성합니다.
- Server Action 흐름과 반환 구조를 임의로 변경하지 않습니다.
- `next/router`를 사용하지 않고 `next/navigation`을 사용합니다.
- `getServerSideProps`, `getStaticProps`, `getInitialProps`를 사용하지 않습니다.
- props와 반환 타입은 명확하게 정의합니다.
- 새 라이브러리는 명시 요청이 있을 때만 추가합니다.

---

## Next.js 16 주의사항

- 이 프로젝트는 Next.js 16.2.1입니다.
- 오래된 Next.js 지식에 의존하지 않습니다.
- 작업 주제가 routing, Server Actions, cache, config, hydration, Supabase 연동과 관련되면 `node_modules/next/dist/docs/`의 관련 문서를 먼저 확인합니다.
- 동적 라우트의 `params`/`searchParams` 패턴은 현재 코드와 Next.js 16 문서를 기준으로 맞춥니다.

---

## 데이터/저장소 규칙

- 환경변수는 `lib/env.ts`를 기준으로 사용합니다.
- Supabase REST 요청은 `lib/supabase/http.ts` 패턴을 우선 사용합니다.
- 블로그 게시글, 댓글, 반응은 `lib/posts.ts` 흐름을 따릅니다.
- 게스트 게시글, 댓글, 반응은 `lib/guest-posts.ts` 흐름을 따릅니다.
- 인증/회원은 `lib/auth/*` 흐름을 따릅니다.
- 파일 저장은 `lib/storage.ts`와 `lib/attachment-utils.ts` 흐름을 유지합니다.
- 날짜/시간은 `lib/date.ts`의 KST 유틸을 사용합니다.
- FormData 문자열 처리는 `lib/form-utils.ts`를 우선 사용합니다.
- JSON 파싱은 `lib/safe-json.ts` 등 안전 유틸을 우선 사용합니다.

---

## 구현된 데이터 구조

- `members`
- `posts`
- `guest_posts`
- `post_comments`
- `guest_post_comments`
- `post_reactions`
- `post_comment_reactions`
- `guest_post_reactions`
- `guest_comment_reactions`
- Supabase Storage `uploads` 버킷

대댓글은 댓글 테이블의 `parent_id`로 표현합니다.

---

## 인증/권한 규칙

- 로그인, 회원가입, 프로필 수정, 비밀번호 변경, 회원 탈퇴는 기존 `lib/auth/*` 흐름을 유지합니다.
- Owner 비밀번호는 입력값을 SHA-256으로 해시한 값과 `OWNER_PASSWORD`를 비교합니다.
- Supabase Auth 회원은 Auth API로 로그인/이메일 인증/비밀번호 변경을 처리합니다.
- 게시글/댓글 관리 권한은 `lib/permissions.ts`를 우선 사용합니다.
- 인증/권한 검증을 제거하지 않습니다.

---

## UI 규칙

- UI 컴포넌트는 가능한 `components/ui/`의 shadcn/ui 컴포넌트를 우선 사용합니다.
- Tailwind 기본 색상을 직접 쓰지 말고 CSS variables 기반 토큰을 우선 사용합니다.
- 기존 레이아웃, spacing, typography, 모바일 대응을 불필요하게 변경하지 않습니다.
- 버튼, 입력, 카드, Dialog 스타일은 기존 패턴과 맞춥니다.
- 댓글 아바타는 현재 `lib/avatar-utils.ts`의 이름 기반 이니셜/색상 아바타 흐름을 따릅니다.

---

## 금지 사항

- `next/router` 사용 금지
- Pages Router API 사용 금지
- 불필요한 `"use client"` 추가 금지
- Server Action 흐름 임의 변경 금지
- 기존 API 응답 구조 또는 함수 반환값 임의 변경 금지
- 기존 UI/디자인/레이아웃 임의 변경 금지
- Tailwind 기본 색상 직접 사용 금지
- 하드코딩된 사용자 입력 신뢰 금지
- 인증/권한 검증 제거 금지
- 환경변수를 각 파일에 흩어놓는 변경 금지
- 새 의존성 임의 추가 금지
- 사용자가 요청하지 않은 리팩터링 금지

---

## 검증

코드 변경 후에는 다음 명령을 실행합니다.

```bash
npm run build
npm run lint
```

Windows PowerShell 실행 정책으로 `npm.ps1`이 막히면 다음 명령을 사용합니다.

```bash
cmd /c npm run build
cmd /c npm run lint
```
