Tech Stack: 확인된 버전

-# Copilot Instructions

이 문서는 AI (GitHub Copilot / Agent)가 이 프로젝트에서 일관된 코드와 UI를 생성하도록 하기 위한 기준이다.

---

## Tech Stack

* Next.js 16.2.1 (App Router ONLY)
* React 19.2.4
* Tailwind CSS 4
* shadcn/ui (components/ui/)

---

## App Structure

* App Router 기반 (`app/` 디렉토리)
* Pages Router 사용 금지 (`pages/`)
* Route segment 기반 구조 유지

---

## Coding Conventions

* 기본은 **Server Component**
* 필요한 경우에만 `"use client"` 사용
* async/await 기반 데이터 처리
* 컴포넌트는 단순하고 검증 가능하게 유지

---

## Design Tokens

### Colors (CSS Variables 기준)

* Primary: `--primary`
* Background: `--background`
* Foreground: `--foreground`
* Muted: `--muted`
* Border: `--border`

Tailwind 기본 색상 직접 사용 금지 (예: `bg-blue-500 금지`)

---

### Layout

* Main container: `max-w-4xl mx-auto px-4`
* Section spacing: `space-y-6`
* Card padding: `p-6`
* Grid:

  * 모바일: 1열
  * md 이상: `grid-cols-2`

---

### Components Style

* Card: `rounded-lg shadow-sm`
* Button: shadcn/ui Button 사용
* Input: shadcn/ui Input 사용
* Dialog: shadcn/ui Dialog 사용

---

## Component Rules

* UI 컴포넌트는 **shadcn/ui 우선 사용**
* 커스텀 컴포넌트는 `components/` 폴더에 위치
* 재사용 가능하게 설계
* props는 명확하게 정의
* 상태(state)는 최소화

---

## Data Fetching Rules

* Server Component에서 fetch 우선
* Client Component에서는 최소한의 fetch만 수행
* 데이터는 props로 전달

---

## State Management Rules

* 가능한 한 Server Component 사용
* Client state는 UI 상태에만 사용 (modal, input 등)
* 전역 상태 사용 최소화

---

## Routing Rules

* `next/navigation`만 사용
* 사용 가능한 API:

  * `useRouter`
  * `redirect`
  * `usePathname`

---

## Known AI Mistakes (주의)

*  `next/router` 사용 금지
*  Pages Router API 사용 금지 (`getServerSideProps`, etc)
*  불필요한 `"use client"` 추가 금지
*  Tailwind 기본 색상 사용 금지
*  컴포넌트 내부에 과도한 로직 작성 금지

---

## Params Handling

* 서버 컴포넌트에서 params는 async 처리
* 필요한 경우 반드시 `await` 사용

---

## UI Consistency Rules

* 버튼 스타일 통일
* spacing 일관성 유지
* typography 계층 유지
* 모바일 대응 필수

---

## File Structure

* `app/` → 페이지
* `components/` → UI 컴포넌트
* `components/ui/` → shadcn/ui
* `lib/` → 유틸 함수
* `types/` → 타입 정의

---

## Output Expectation (AI에게 요구)

AI는 다음을 만족해야 한다:

* 코드가 간결할 것
* 디자인 일관성 유지
* 불필요한 상태/로직 없음
* App Router 규칙 준수
* 재사용 가능한 구조

---

## Principle

* 단순하게 시작하고 점진적으로 확장
* 서버 중심 구조 유지
* UI는 일관성을 최우선으로 한다
