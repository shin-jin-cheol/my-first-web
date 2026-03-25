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
