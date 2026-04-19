Tech Stack: 확인된 버전

- Next.js: 16.2.1 (App Router ONLY)
- Tailwind CSS: ^4

Coding Conventions

- 기본 컴포넌트 타입: Server Component를 기본으로 사용합니다.
- 스타일링: Tailwind CSS만 사용합니다. 다른 CSS-in-JS나 전역 CSS 프레임워크 사용 금지.

App 구조

- App Router 전용 프로젝트입니다. `app/` 디렉토리 기반 라우팅을 사용하세요.
- Pages Router(`pages/`) 사용 금지.

Known AI Mistakes (주의사항)

- `next/router` 사용 금지 — 라우팅/네비게이션 관련 작업은 `next/navigation`을 사용하세요.
- Pages Router 관련 API/패턴 사용 금지(예: `getServerSideProps`, `getStaticProps`, `next/router` 등).
- `params` 값을 처리할 때는 반드시 `await`를 사용하세요 (예: 서버 컴포넌트에서 비동기 데이터/params 처리 시 `await` 누락 주의).

추가 지침

- 명시적이지 않은 경우에도 Server Component를 우선으로 설계하고, 클라이언트 상호작용이 필요할 때만 'use client'를 선언해 Client Component로 전환하세요.
- 라우팅, 링크, 네비게이션 관련 구현은 `next/navigation`의 `useRouter`, `redirect`, `usePathname` 등 App Router 전용 API를 사용하세요.

이 파일은 팀 공통 코파일럿/에이전트 지침입니다 — 로컬 스타일이나 예외가 필요하면 별도 합의를 통해 문서화하세요.

## Tech Stack

- Next.js 16.2.1 (App Router only)
- React 19.2.4
- Tailwind CSS 4
- shadcn/ui (components/ui/ 경로에 설치됨)

## Coding Conventions
- Default to Server Components unless a Client Component is required.
- Use Tailwind CSS for styling.
- Keep components simple and easy to verify.
- Prefer files inside `app/` for routes.

## Design Tokens

- Primary color: shadcn/ui --primary
- Background: --background
- Card: shadcn/ui Card 컴포넌트 사용 (rounded-lg shadow-sm)
- Spacing: 컨텐츠 간격 space-y-6, 카드 내부 p-6
- Max width: max-w-4xl mx-auto (메인 컨텐츠)
- 반응형: md 이상 2열 그리드, 모바일 1열

## Component Rules

- UI 컴포넌트는 shadcn/ui 사용 (components/ui/)
- Button, Card, Input, Dialog 등 shadcn/ui 컴포넌트 우선
- 커스텀 컴포넌트는 components/ 루트에 배치
- Tailwind 기본 컬러 직접 사용 금지 → CSS 변수(디자인 토큰) 사용

## Known AI Mistakes

- Do not use `next/router`; use `next/navigation` when navigation is needed.
- Do not create `pages/` router files; this project uses the App Router.
- Do not add `"use client"` unless interactivity or browser APIs are actually needed.