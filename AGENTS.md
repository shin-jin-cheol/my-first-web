<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.2.1. APIs, conventions, and file structure may differ from older Next.js versions. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` and follow deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## 1. 프로젝트 개요

이 프로젝트는 개인 블로그와 게스트 커뮤니티 기능을 함께 제공하는 Next.js 애플리케이션입니다.

- 블로그 게시글 CRUD
- 게스트 게시판 CRUD
- 회원가입, 로그인, 회원 관리
- 댓글 기능
- 카테고리 시스템
- 파일 업로드
- 다국어 텍스트 처리
- Supabase, Vercel Blob, Local fallback 기반 데이터 및 파일 저장
- Vercel 프로덕션 배포

주요 라우트는 App Router 기반입니다.

- `/`: 홈, 최신 글 목록
- `/posts`, `/posts/[id]`, `/posts/new`, `/posts/[id]/edit`: 블로그
- `/guest`, `/guest/[id]`, `/guest/new`, `/guest/[id]/edit`, `/guest/account`: 게스트 게시판
- `/auth/login`, `/auth/signup`: 인증
- `/admin/members`: 관리자 회원 관리
- `/api/gemini`: 서버 사이드 API 프록시

## 2. 기술 스택

- Framework: Next.js 16.2.1, App Router only
- UI: React 19.2.4
- Styling: Tailwind CSS 4, CSS variables
- UI Components: shadcn/ui under `components/ui/`
- Backend: Supabase
- File Storage: Supabase Storage, Vercel Blob, Local fallback
- Deployment: Vercel
- Language: TypeScript
- Lint: ESLint 9, `eslint-config-next` 16.2.1

## 3. 반드시 읽어야 할 규칙 파일 목록

작업 전 아래 파일을 먼저 읽고 현재 작업에 적용해야 합니다.

- `ARCHITECTURE.md`
- `context.md`
- `.github/copilot-instructions.md`
- 작업 주제와 관련된 `node_modules/next/dist/docs/` 문서

작업 내용이 Supabase, storage, hydration, Server Actions, routing, cache, config와 관련되면 반드시 해당 Next.js 로컬 문서를 먼저 확인합니다.

## 4. 코딩 컨벤션

- App Router만 사용합니다. `pages/` Router API를 사용하지 않습니다.
- 기본은 Server Component입니다.
- `"use client"`는 브라우저 API, 상태, 이벤트 핸들러가 필요한 경우에만 추가합니다.
- 데이터 처리와 Server Action은 `async/await` 기반으로 작성합니다.
- Server Action 흐름과 반환 구조를 임의로 변경하지 않습니다.
- 환경 변수는 `lib/env.ts`에서 중앙 관리합니다.
- Supabase HTTP 요청은 기존 `lib/supabase/http.ts` 패턴을 따릅니다.
- FormData 문자열/숫자 처리는 `lib/form-utils.ts`를 우선 사용합니다.
- 저장소 및 파일 fallback 처리는 `lib/storage.ts`와 `lib/attachment-utils.ts`의 기존 흐름을 유지합니다.
- 날짜 처리는 `lib/date.ts`의 KST 유틸을 사용합니다.
- JSON 파싱은 `lib/safe-json.ts` 등 기존 안전 유틸을 우선 사용합니다.
- URL, 링크, 파일 검증은 기존 검증 유틸과 정책을 유지합니다.
- UI 컴포넌트는 가능한 `components/ui/`의 shadcn/ui 컴포넌트를 우선 사용합니다.
- Tailwind 기본 색상 직접 사용을 피하고 CSS variables를 우선 사용합니다.
- 기존 UI, 레이아웃, spacing, typography, 모바일 대응을 불필요하게 변경하지 않습니다.
- props와 반환 타입은 명확하게 정의합니다.
- 새 라이브러리는 사용자가 명시적으로 요청한 경우에만 추가합니다.

## 5. 절대 하면 안 되는 것들

- `next/router` 사용 금지
- Pages Router API 사용 금지: `getServerSideProps`, `getStaticProps`, `getInitialProps`
- 불필요한 `"use client"` 추가 금지
- Server Action 흐름 임의 변경 금지
- 기존 API 응답 구조 또는 함수 반환값 임의 변경 금지
- 기존 UI/디자인/레이아웃 임의 변경 금지
- Tailwind 기본 색상 직접 사용 금지
- 하드코딩된 사용자 입력 신뢰 금지
- 인증/권한 검증 제거 금지
- 환경 변수를 각 파일에 흩어놓는 변경 금지
- 새 의존성 임의 추가 금지
- 사용자가 요청하지 않은 리팩터링 금지
- 사용자가 만든 변경을 임의로 되돌리기 금지
- 배포 전 검증 없이 완료 처리 금지

## 6. 작업 완료 후 반드시 실행할 명령어

코드 변경 후에는 아래 명령을 실행하고 결과를 보고합니다.

```bash
npm run build
npm run lint
```

Windows PowerShell 실행 정책으로 `npm.ps1`이 막히면 아래처럼 실행합니다.

```bash
cmd /c npm run build
cmd /c npm run lint
```

Next font 또는 Vercel 관련 네트워크 fetch가 필요한 경우에는 네트워크 권한을 허용받아 재실행합니다.

## 7. 브랜치 전략

- 기본 배포 브랜치: `master`
- 기능 작업은 목적이 분명한 별도 브랜치에서 진행합니다.
- 기존 브랜치를 사용하라는 명시가 없으면 작업명 기반 브랜치를 사용합니다.
- Codex에서 새 브랜치를 만들 때는 기본적으로 `codex/` prefix를 사용합니다.
- 사용자가 특정 브랜치명을 지정하면 그 지시를 우선합니다.
- 배포 요청 시에는 사용자가 지정한 순서를 그대로 따릅니다.
- `master` 머지는 사용자가 명시적으로 요청한 경우에만 수행합니다.
- 히스토리 파괴 명령은 금지합니다: `git reset --hard`, 강제 push 등.

## 8. 커밋 메시지 규칙

커밋 메시지는 변경 목적이 드러나는 Conventional Commits 형식을 사용합니다.

- `feat:` 새 기능
- `fix:` 버그 수정
- `refactor:` 동작 변경 없는 구조 개선
- `style:` UI 또는 스타일 조정
- `docs:` 문서 변경
- `chore:` 설정, 빌드, 기타 관리 작업
- `revert:` 이전 커밋 되돌리기

예시:

```text
fix: Server Actions body 크기 제한 10MB로 설정
refactor: storage 전략 통합
refactor: FormData 공통 유틸 추출 및 i18n 텍스트 처리
fix: ThemeToggle hydration mismatch 및 BGM 버튼 아이콘 이모지 방지 수정
```

사용자가 커밋 메시지를 지정한 경우에는 지정된 메시지를 그대로 사용합니다.
