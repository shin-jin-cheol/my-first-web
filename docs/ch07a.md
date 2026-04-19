# Chapter 7. 웹 앱 아키텍처 & AI 디자인 설계

> **미션**: Ch1~6에서 만든 블로그에 아키텍처를 보강한다 — shadcn/ui 컴포넌트, 디자인 토큰, DB 스키마 계획이 바이브코딩 품질을 결정한다
> 

---

## 바이브코딩 원칙 (이번 장)

이 교재에서의 **바이브코딩**은 “그때그때 떠오르는 대로 코딩”이 아니라, **의도(설계) → 맥락(컨텍스트) → 제약(규칙) → 실행(단계) → 검증(체크)**를 **GitHub Copilot**에 명확히 전달해 **내 프로젝트다운 결과**를 빠르게 얻는 방식이다.

이번 장(설계/디자인)에서 특히 중요한 원칙:

1. **결과물 정의가 먼저**: “로그인 페이지”가 아니라 “어떤 사용자에게, 어떤 흐름으로, 어떤 느낌(토큰)으로”인지 정의한다.
2. **시각적 컨텍스트를 준다**: 스케치/레퍼런스/디자인 토큰(색상, 간격, 타이포)을 제공한다.
3. **Copilot의 추측을 금지한다**: 기술 스택(Next.js, Tailwind, shadcn/ui)과 컴포넌트 제약을 명시한다.
4. **한 번에 크게 말고 단계로**: (1) 페이지 맵 보강 → (2) 유저 플로우 → (3) UI 스펙 → (4) 파일 구조/설계서 반영 순서.
5. **산출물을 문서로 고정**: 범용 파일 3종(`copilot-instructions.md`, `context.md`, `todo.md`)과 프로젝트 설계 파일(`ARCHITECTURE.md`) 같은 "고정된 맥락"을 만들어 다음 장의 Copilot 프롬프트 품질을 올린다.

---

## 제작 과정 (원리 → 방법 → 실행)

바이브코딩 “만” 하면 눈뜬 봉사가 된다. 이유는 간단하다: **어떤 산출물을 어떤 순서로 만들지**가 없으면, Copilot의 출력은 “그럴듯한 코드”로 흩어지기 쉽다.

그래서 이 장에서는 **제작 과정(워크플로우)**을 먼저 고정하고, 그 과정 중 “Copilot이 강한 구간”만 바이브코딩으로 빠르게 진행한다.

### 7.0.1 Copilot이 강한 구간 vs 굳이 안 써도 되는 구간

- Copilot이 강한 구간: 문서 초안 작성, 페이지/컴포넌트 뼈대 생성, 반복 UI 패턴(shadcn/ui), 체크리스트/테스트 시나리오 생성
- 굳이 안 써도 되는 구간: 비밀키 입력/관리, 패키지 설치 같은 단순 명령 실행, “결정” 자체(무엇을 만들지/무엇을 안 만들지), 최종 검증(직접 클릭/테스트)

### 7.0.2 권장 제작 순서 (처음부터 시작)

1. **범용 파일부터**: `copilot-instructions.md`에 코딩 규칙(폴더 규칙, 컴포넌트 규칙, 토큰)을 적어 "추측 금지"를 만든다. `context.md`, `todo.md`도 초기화한다.
2. **프로젝트 설계**: `ARCHITECTURE.md`에 목표/페이지맵/유저플로우/디자인토큰을 먼저 적어 "정답지(맥락)"를 만든다.
3. **그 다음 구현**: App Router 폴더 구조 보강 → 공통 레이아웃(Header/Footer) 개선 → 핵심 페이지 1개씩.
4. **매 단계 검증**: `npm run dev`로 직접 확인하고, 깨지는 지점은 “재현 절차 + 에러 원문”으로 Copilot에 재요청한다.

### 7.0.3 제작 과정용 Copilot 프롬프트 세트 (단계별)

아래 프롬프트는 “제작 과정”의 각 단계에서 **그대로 복사/붙여넣기** 해서 쓰도록 만든 것이다.

한 번에 큰 프롬프트 1개로 끝내려 하지 말고, **단계별로 나눠** Copilot이 컨텍스트를 잃지 않게 한다.

### (1) 기술문서 작성: [ARCHITECTURE.md](http://architecture.md/) 초안

```
너는 GitHub Copilot Chat이야. 지금부터 `my-first-web`(개인 블로그) 프로젝트의 아키텍처를 보강한다.
기술 스택은 Next.js(App Router) + TypeScript + Tailwind + shadcn/ui 로 고정한다.

해야 할 일: 리포지토리 루트에 넣을 `ARCHITECTURE.md` 초안을 작성해줘.

[프로젝트 의도]
- 사이트 목적: 개인 블로그 — 글 작성/목록/상세 + 로그인 후 글 관리
- 타깃 사용자: 블로그 독자 / 블로그 운영자(작성자)

[디자인 토큰(초안)]
- 톤: 깔끔함 / 가독성 / 여백
- Primary=#8B6B4E, Background=#FBF8F3, Text=#3A2E26, Border=#E8DDD0

[요구 산출물(ARCHITECTURE.md에 포함)]
1) Goals / Non-goals
2) Page Map (App Router 경로로)
3) User Flow 3개: 포스트 읽기, 포스트 작성, 마이페이지 확인
4) Component Hierarchy (Layout 기준)
5) Data Model은 "초안"만(테이블 이름 수준) — 상세 스키마는 Ch8에서 확정

형식: 바로 파일에 붙여넣을 수 있게 마크다운 전체를 출력해줘.
```

### (2) 규칙 작성: [copilot-instructions.md](http://copilot-instructions.md/) 초안

```
너는 GitHub Copilot Chat이야. 이 프로젝트에서 Copilot이 코드를 "추측"하지 않도록 규칙 문서를 만든다.
리포지토리 루트에 넣을 `copilot-instructions.md` 초안을 작성해줘.

[프로젝트]
- my-first-web (개인 블로그)
- Next.js App Router + TS
- Tailwind + shadcn/ui

[규칙에 반드시 포함]
1) 폴더/파일 규칙: app 라우팅, components 구조, lib 유틸
2) UI 규칙: shadcn/ui 우선 사용, className 패턴, 반응형 기본값
3) 디자인 토큰: 컬러/타이포/간격(위 토큰 준수)
4) 데이터 접근 규칙: (아직 Supabase 전) "데이터는 lib 레이어로 분리" 원칙만
5) Copilot 응답 형식: 변경 파일 목록 + 이유 + 다음 검증 방법

주의: 기존 파일 구조를 존중하면서 규칙을 작성해줘.
```

### (3) 구현 시작: App Router 뼈대/네비게이션

```
이제 문서(ARCHITECTURE.md, copilot-instructions.md)를 기준으로 기존 블로그의 구조를 보강한다.

목표: 기존 Next.js App Router 뼈대에 shadcn/ui 컴포넌트를 적용하고 레이아웃을 개선한다.

[페이지(기존 + 보강)]
- / (홈)
- /about
- /posts
- /posts/new
- /posts/[id]
- /login
- /signup
- /mypage

[요구 출력]
1) 수정할 파일 경로 목록
2) `app/layout.tsx`에서 공통 레이아웃(헤더/푸터 포함) shadcn/ui 적용
3) 헤더 네비게이션 항목과 링크(위 페이지)
4) 각 페이지에 shadcn/ui 컴포넌트(Card, Button 등) 적용

제약: 디자인 토큰은 copilot-instructions.md를 따르고, 기존 코드 구조를 최대한 유지한다.
```

### (4) 검증/디버깅 요청 템플릿 (바이브코딩이 필요한 순간)

```
너는 GitHub Copilot Chat이야. 아래 재현 절차/에러를 기준으로 원인 분석과 최소 수정안을 제안해줘.

[재현 절차]
1) ___
2) ___
3) ___

[기대 동작]
- ___

[실제 동작]
- ___

[에러 원문/로그]
```text
여기에 콘솔/터미널 에러 원문을 붙여넣기
```

[추가 컨텍스트]

- 변경한 파일 경로:
- 관련 코드 스니펫:

요구: 1) 원인 2) 수정할 파일 3) 패치 형태(코드) 4) 다시 확인할 체크리스트 순서로 답해줘.

```

---

## Copilot 프롬프트 (복사/붙여넣기)

아래 프롬프트는 `my-first-web` 실습 프로젝트의 "설계서/디자인 의도"를 보강하기 위한 템플릿이다. (텍스트로 먼저 확정 → VS Code의 Copilot Chat 또는 Copilot Vision/v0에 입력)

```text
너는 GitHub Copilot Chat이고, 내 `my-first-web`(개인 블로그) 프로젝트의 제품/프론트엔드 설계 파트너야.
기술 스택: Next.js(App Router) + React + Tailwind CSS + shadcn/ui.
목표: Ch1~6에서 만든 블로그에 기술문서를 추가하고(ARCHITECTURE.md, copilot-instructions.md), 그 문서를 기준으로 Copilot이 추측 없이 구현할 수 있게 만드는 것.

[현재 상태]
- 현재 상태: Ch1~6에서 블로그 기본 구조(홈, 글 목록, 글 작성, 로그인)가 만들어져 있다
- 이번에 만들 것(순서대로):
  1) `ARCHITECTURE.md` 보강(디자인 토큰 + Page Map + User Flow)
  2) `copilot-instructions.md` 보강(코딩/디자인 규칙)
  3) shadcn/ui 컴포넌트 시스템 도입
  4) DB 스키마 계획 (Ch8 Supabase 대비)

[사용자/도메인]
- 타깃 사용자: 블로그 독자, 블로그 운영자(작성자)
- 핵심 문제/가치: 깔끔한 글 읽기 경험 + 편리한 글 작성/관리

[디자인 의도/토큰]
- 분위기 키워드 3개: 깔끔함 / 가독성 / 여백있는 정보
- 컬러(고정): Primary=#8B6B4E, Background=#FBF8F3, Text=#3A2E26, Border=#E8DDD0
- 레이아웃: 상단 헤더 + 섹션형 랜딩 + CTA 중심
- 금지: 네온 컬러, 과한 그라디언트, 과한 그림자

[요구 산출물]
1) Page Map: App Router 경로로 정리 (예: /, /about, /posts, /posts/new, /posts/[id], /login, /signup, /mypage)
2) User Flow: 비로그인/로그인 상태의 주요 플로우 3개 (글 읽기, 글 작성, 마이페이지 확인)
3) 각 페이지 UI 스펙: 주요 컴포넌트(shadcn/ui 기준) + 상태(loading/empty/error)
4) `ARCHITECTURE.md`에 바로 붙여넣을 보완안: Goals, Page Map, User Flow, Non-goals
5) `copilot-instructions.md`에 넣을 “디자인/컴포넌트 규칙” 초안(토큰, 버튼/카드 스타일, 타이포)

형식: 표/불릿을 섞어 읽기 쉽게. 애매한 부분은 질문 5개 이내로 되물어줘.
```

## 학습목표

1. 설계 없는 바이브코딩이 왜 "AI 슬롭"을 만드는지 설명할 수 있다
2. **범용 컨텍스트 파일 3종**([copilot-instructions.md](http://copilot-instructions.md/), [context.md](http://context.md/), [todo.md](http://todo.md/))과 **프로젝트별 설계 파일**([ARCHITECTURE.md](http://architecture.md/))을 구분하여 사용할 수 있다
3. 페이지 맵과 유저 플로우로 앱 구조를 설계할 수 있다
4. Copilot Vision으로 스케치를 코드로 변환하고, v0를 활용하여 프로토타입을 생성할 수 있다
5. shadcn/ui를 설치하고 디자인 토큰으로 테마를 커스터마이징할 수 있다
6. context.md와 todo.md로 세션 간 컨텍스트를 관리하고, 세션 시작 프롬프트로 Copilot에 주입할 수 있다

---

## 7.1 왜 설계가 먼저인가

지금까지 Next.js로 페이지를 나누고, 상태를 관리하고, 데이터를 가져오는 방법을 배웠다. Ch1~6에서 블로그의 기본 구조를 만들었지만, 한 가지 빠진 것이 있다. **"어떻게 체계적으로 만들 것인지"를 정하는 과정**이다.

### 7.1.1 설계 없는 바이브코딩의 문제점: "AI 슬롭"과 균일한 UI

AI에게 "블로그 만들어줘"라고 하면 코드가 만들어진다. 문제는, **모든 학생이 똑같은 결과물을 받는다**는 것이다. 같은 프롬프트 -> 같은 AI -> 같은 디자인. 이렇게 만들어진 결과물을 **AI 슬롭**(AI Slop)이라 부른다.

AI 슬롭의 특징:

- 모든 프로젝트가 비슷하게 생겼다 (같은 색상, 같은 레이아웃)
- 디자인에 의도가 없다 (왜 이 색인지, 왜 이 배치인지 설명할 수 없다)
- 사용자 경험을 고려하지 않았다 (어디를 클릭해야 하는지 헷갈린다)

반대로, **설계서를 먼저 작성하고 AI에게 제공하면** 결과가 달라진다. "파란색 계열 테마, 왼쪽에 사이드바, 카드 리스트 형태"처럼 구체적인 지시를 담은 설계서가 있으면, AI는 그 의도에 맞는 코드를 생성한다.

> **팁**: "설계 없이 만든 블로그"과 "설계서를 기반으로 만든 블로그"을 비교해보자. 차이가 극명하다.
> 

### 7.1.2 AI는 디자인 감각이 없다 — 시각적 컨텍스트가 필요한 이유

2장에서 AI의 3대 한계를 배웠다. 디자인에는 **네 번째 한계**가 추가된다: AI는 **시각적 의도를 이해하지 못한다**.

AI는 텍스트로 학습했다. "깔끔한 디자인"이라고 요청하면, AI가 생각하는 "깔끔함"과 내가 원하는 "깔끔함"이 다를 수 있다. AI에게는 레퍼런스 이미지, 색상 코드, 구체적인 레이아웃 지시가 필요하다.

**표 7.3** 모호한 지시 vs 구체적 지시

| 모호한 지시 (결과 예측 불가) | 구체적 지시 (의도 전달 가능) |
| --- | --- |
| "예쁘게 만들어줘" | "primary: blue-600, 배경: gray-50, 카드: 흰색 + 둥근 모서리(rounded-lg)" |
| "깔끔하게 배치해줘" | "2열 그리드(md:grid-cols-2), 간격 gap-6, 최대 너비 max-w-4xl" |
| "모바일에서도 보이게" | "md 이상 2열, sm 이하 1열, 사이드바는 모바일에서 숨김" |

### 7.1.3 좋은 설계 = 좋은 프롬프트: 3단계 디자인 파이프라인

바이브코딩에서 디자인 품질을 높이는 방법은 **3단계 디자인 파이프라인**(Design Pipeline)을 따르는 것이다:

```
① 탐색 — 레퍼런스 수집 (마음에 드는 사이트/앱 스크린샷)
    ↓
② 프로토타입 — 와이어프레임 + AI 프로토타입 (손그림 → v0/AI 이미지 첨부)
    ↓
③ 코드 — 설계서 기반 코드 생성 (shadcn/ui + Copilot)
```

이 장에서 3단계를 모두 실습한다. 핵심은 **1번을 건너뛰지 않는 것**이다. 레퍼런스 없이 바로 코드를 작성하면 AI 슬롭이 된다.

---

## 7.2 코파일럿 컨텍스트 관리 — 범용 파일 3종

### 7.2.1 Copilot의 기억 한계와 범용 컨텍스트 파일

Copilot Chat은 **대화를 닫으면 이전 맥락을 모두 잊는다**. 이것이 문제가 되는 상황:

- 월요일에 "포스트 목록 페이지" 작업 → 수요일에 이어서 "포스트 상세 페이지" 요청 → **Copilot은 월요일 작업을 모른다**
- "지난번에 만든 디자인 토큰 기준으로 해줘" → Copilot: "어떤 토큰인가요?"

바이브코딩에서 프로젝트를 체계적으로 관리하려면 **AI 기억 보조 파일**이 필요하다. 이 섹션에서는 **모든 프로젝트에 공통으로 사용하는 3가지 범용 파일**을 소개한다:

**표 7.2** 범용 컨텍스트 파일 3종 (모든 프로젝트 공통)

| 파일 | 역할 | Copilot 자동 로드 | 비유 | 범위 |
| --- | --- | --- | --- | --- |
| `copilot-instructions.md` | 규칙 — "이렇게 코딩해라" | ✅ | 회사 사규 | **모든 프로젝트** |
| `context.md` | 상태 — "여기까지 했다" | ❌ | 작업 일지 | **모든 프로젝트** |
| `todo.md` | 할 일 — "다음에 이걸 한다" | ❌ | 체크리스트 | **모든 프로젝트** |

> **핵심**: `copilot-instructions.md`만 자동 로드된다. 나머지 2개는 Copilot Chat에서 **`#file:파일명`으로 직접 참조**해야 한다.
> 

> **중요**: 프로젝트별 설계 문서 ([ARCHITECTURE.md](http://architecture.md/))는 7.7절에서 별도로 다룬다.
> 

### 7.2.2 [copilot-instructions.md](http://copilot-instructions.md/) — 규칙 (자동 로드)

2장에서 작성한 `.github/copilot-instructions.md`는 **프로젝트의 코딩 규칙**을 정의하는 파일이다. Copilot이 항상 자동으로 읽어들이므로, 여기에 작성한 규칙은 **모든 대화에서 적용**된다.

**copilot-instructions.md의 주요 섹션**:

```markdown
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
```

**언제 업데이트하는가**:

- shadcn/ui 설치 후 → Tech Stack에 추가
- 디자인 토큰 확정 후 → Design Tokens 섹션 작성
- AI가 같은 실수를 반복할 때 → Known AI Mistakes에 기록

### 7.2.3 [context.md](http://context.md/) — 상태 (수동 참조)

`context.md`는 **프로젝트의 현재 상태를 기록하는 파일**이다. AI가 "지금 이 프로젝트가 어디까지 진행되었는지"를 한눈에 파악할 수 있게 한다.

**❗️중요**: `context.md`는 `copilot-instructions.md`와 **완전히 다른 역할**을 한다:

- [**copilot-instructions.md**](http://copilot-instructions.md/): 규칙 (변하지 않음, 자동 로드)
- [**context.md**](http://context.md/): 상태 (계속 변함, 수동 참조)

프로젝트 루트에 `context.md`를 생성한다:

```markdown
# Context — my-first-web 프로젝트 상태

## 현재 상태

- 마지막 작업일: 2026-02-26
- 완료된 작업: 홈 페이지, 헤더/푸터 레이아웃, 포스트 목록
- 진행 중: 포스트 상세 페이지 (UI 완료, 데이터 연결 미완)
- 미착수: 마이페이지

## 기술 결정 사항

- 인증: Supabase Auth (Email)
- 상태관리: React Context (AuthProvider)
- 이미지: Supabase Storage 사용 예정

## 해결된 이슈

- shadcn/ui Button variant가 디자인 토큰과 불일치 → globals.css의 --primary 수정으로 해결
- 모바일 헤더 메뉴가 겹침 → Sheet 컴포넌트로 교체

## 알게 된 점

- Tailwind CSS 4 기준에서는 `@import "tailwindcss"` + `@theme` 블록으로 설정 (`tailwind.config.js` 불필요)
- Server Component에서 useRouter 사용 불가 → redirect() 사용
```

**각 섹션의 역할**:

| 섹션 | 기록하는 것 | 왜 필요한가 |
| --- | --- | --- |
| 현재 상태 | 완료/진행 중/미착수 | Copilot이 **중복 작업을 피한다** |
| 기술 결정 사항 | 이미 결정된 기술 선택 | Copilot이 **다른 기술을 제안하지 않는다** |
| 해결된 이슈 | 과거에 겪은 문제와 해결법 | **같은 실수를 반복하지 않는다** |
| 알게 된 점 | 작업 중 발견한 주의사항 | **프로젝트 고유의 노하우가 축적된다** |

**업데이트 시점**: 작업 세션을 마칠 때마다 context.md를 갱신한다. Copilot에게 요청:

```
오늘 작업한 내용을 정리해서 context.md를 업데이트해줘.
변경된 파일, 해결한 이슈, 새로 알게 된 점을 포함해줘.
```

### 7.2.4 [todo.md](http://todo.md/) — 작업 흐름 추적

`todo.md`는 **체크박스 기반의 할 일 목록**이다. 프로젝트의 전체 진행률을 한눈에 보여주고, Copilot이 "다음에 뭘 해야 하는지"를 자동으로 파악할 수 있게 한다.

프로젝트 루트에 `todo.md`를 생성한다:

```markdown
# TODO — my-first-web

## 1단계: 기본 구조 (Ch7~8)

- [x] ARCHITECTURE.md 작성
- [x] copilot-instructions.md 작성
- [x] shadcn/ui 초기화 + 테마 설정
- [x] 헤더/푸터 레이아웃
- [x] 홈 페이지
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 작성

## 2단계: 핵심 기능 (Ch9~10)

- [x] 포스트 목록 페이지
- [ ] 포스트 상세 페이지
- [ ] 포스트 작성 (CRUD)
- [ ] 로그인/회원가입

## 3단계: 고급 기능 (Ch11~12)

- [ ] 마이페이지
- [ ] 댓글 기능

## 진행률: 6/12 (50%)
```

[**todo.md](http://todo.md/) 작성 규칙**:

- **단계별로 묶는다** — 무작정 나열하지 않고 프로젝트 진행 순서에 맞춘다
- **체크박스(`[x]` / `[ ]`)를 사용한다** — Copilot이 완료 상태를 인식한다
- **진행률을 하단에 기록한다** — 전체 감각을 유지한다

**업데이트 시점**: 작업을 시작하기 전에 todo.md를 확인하고, 완료된 항목은 체크(`[x]`)한다. Copilot에게 요청:

```
방금 포스트 상세 페이지를 완성했어. todo.md에서 해당 항목을 체크하고 진행률을 업데이트해줘.
```

### 7.2.5 세션 시작/종료 프롬프트 — Copilot에 컨텍스트 주입하기

범용 컨텍스트 파일의 진짜 힘은 **Copilot Chat을 새로 열 때 한꺼번에 주입**할 때 나온다.

**세션 시작 프롬프트 (기본)** — 새 대화를 열고 가장 먼저 입력:

```
#file:context.md #file:todo.md

이전 작업을 이어서 진행하려고 해.
context.md에서 현재 상태를 파악하고,
todo.md에서 다음 할 일을 찾아서 진행해줘.
```

> **팁**: `copilot-instructions.md`는 `#file:`로 참조하지 않아도 **자동 로드**된다.
> 

**프로젝트에 설계 문서가 있는 경우** (7.7절에서 작성하는 [ARCHITECTURE.md](http://architecture.md/) 등):

```
#file:context.md #file:todo.md #file:ARCHITECTURE.md

이전 작업을 이어서 진행하려고 해.
context.md에서 현재 상태를 파악하고,
todo.md에서 다음 할 일을 찾아서 진행해줘.
ARCHITECTURE.md의 설계를 따라줘.
```

> **팁**: `#file:ARCHITECTURE.md`는 프로젝트별 설계 파일. 모든 프로젝트에 필수는 아니다.
> 

이 프롬프트 하나로 Copilot은:

1. **어디까지 했는지** 파악하고 ([context.md](http://context.md/))
2. **다음에 뭘 할지** 알고 ([todo.md](http://todo.md/))
3. **어떤 규칙으로 코딩할지** 준수한다 ([copilot-instructions.md](http://copilot-instructions.md/) — 자동)
4. **(프로젝트별)** 어떤 구조로 만들지 이해한다 ([ARCHITECTURE.md](http://architecture.md/) — 선택)

```
세션 시작 시 Copilot이 받는 컨텍스트:

┌─────────────────────────────────────────┐
│  copilot-instructions.md  (자동 로드)    │  ← 규칙 (모든 프로젝트)
├─────────────────────────────────────────┤
│  #file:context.md         (수동 참조)    │  ← 상태 (모든 프로젝트)
│  #file:todo.md            (수동 참조)    │  ← 할 일 (모든 프로젝트)
├─────────────────────────────────────────┤
│  #file:ARCHITECTURE.md    (수동, 선택)   │  ← 설계 (프로젝트별)
├─────────────────────────────────────────┤
│  열린 파일들               (자동 포함)    │  ← 현재 코드
└─────────────────────────────────────────┘
```

**세션 종료 프롬프트** — 작업을 마칠 때:

```
오늘 작업을 마무리하려고 해.
1) context.md를 업데이트해줘 (변경 파일, 해결 이슈, 알게 된 점)
2) todo.md에서 완료 항목을 체크하고 진행률을 갱신해줘
```

이렇게 하면 **다음 세션에서 Copilot이 바로 이어서 작업**할 수 있다. AI의 기억력 한계를 파일 시스템으로 보완하는 것이다.

---

## 7.3 페이지 구조 설계

코드를 작성하기 전에, 앱에 **어떤 페이지가 필요한지**부터 정리한다. 이것이 **페이지 맵**(Page Map)이다.

### 7.3.1 어떤 페이지가 필요한가 (페이지 맵)

`my-first-web`의 포스트 기능을 예로 들면:

```
홈 (/)
├── 포스트 목록 (/posts)
│   ├── 포스트 상세 (/posts/[id])
│   └── 포스트 작성 (/posts/new)
├── 로그인 (/login)
├── 마이페이지 (/mypage)
```

**페이지 맵은 종이에 그려도 충분하다.** 중요한 것은 "어떤 페이지가 있는지"와 "페이지 간 관계"를 한눈에 파악하는 것이다.

### 7.3.2 페이지별 URL 구조 정의 (Next.js App Router 기준)

페이지 맵을 그렸으면, Next.js App Router의 폴더 구조로 변환한다:

**표 7.4** 페이지 맵 -> App Router 폴더 구조

| 페이지 | URL | 폴더/파일 |
| --- | --- | --- |
| 홈 | `/` | `app/page.tsx` |
| 포스트 목록 | `/posts` | `app/posts/page.tsx` |
| 포스트 상세 | `/posts/[id]` | `app/posts/[id]/page.tsx` |
| 포스트 작성 | `/posts/new` | `app/posts/new/page.tsx` |
| 로그인 | `/login` | `app/login/page.tsx` |
| 마이페이지 | `/mypage` | `app/mypage/page.tsx` |

Next.js의 파일 기반 라우팅이 여기서 다시 등장한다. 설계 단계에서 URL 구조를 미리 정하면, Copilot에게 "이 URL 구조에 맞춰서 만들어줘"라고 지시할 수 있다.

### 7.3.3 페이지 간 이동 흐름 (유저 플로우)

**유저 플로우**(User Flow)는 사용자가 특정 목표를 달성하기까지의 화면 이동 경로이다.

예를 들어 "비로그인 사용자가 블로그 글을 작성하는 경우":

```
홈 → "포스트" 진입 → "글쓰기" 클릭 → 로그인 페이지로 이동 → 이메일 로그인
→ 포스트 작성 페이지로 돌아옴 → 글 작성 → 제출 → 포스트 상세
```

이런 흐름을 미리 정리해두면 두 가지가 좋아진다:

- AI에게 **"로그인하지 않은 사용자가 글쓰기를 누르면 로그인 페이지로 리다이렉트해줘"**처럼 명확한 프롬프트를 줄 수 있다
- 빠뜨린 페이지나 경로를 미리 발견할 수 있다

> **팁**: 블로그 앱의 유저 플로우 3가지(글 읽기, 글 쓰기, 내 글 수정)를 직접 그려보자.
> 

---

## 7.4 AI로 와이어프레임 만들기

### 7.4.1 와이어프레임이란: 복잡한 디자인이 아닌 뼈대 잡기

**와이어프레임**(Wireframe)은 페이지의 **뼈대 구조**를 단순하게 표현한 설계도이다. 색상, 이미지, 폰트 없이 **"어디에 무엇이 배치되는지"**만 표현한다.

와이어프레임은 **완벽할 필요가 없다**. 목적은 AI에게 "이런 구조로 만들어줘"라는 **시각적 컨텍스트를 전달**하는 것이다.

### 7.4.2 종이/화이트보드에서 시작하기

가장 빠른 와이어프레임 도구는 **종이와 펜**이다.

> **실습 안내**: 종이에 블로그 메인 페이지와 포스트 상세 페이지를 5분 동안 스케치한다.
> 

스케치할 때 포함할 요소:

- 상단: 네비게이션 바 (로고, 메뉴, 로그인 버튼)
- 메인: 콘텐츠 영역 (카드 리스트 또는 상세 본문)
- 하단: 푸터 (선택)
- 각 영역에 "이것은 무엇이다"를 글씨로 적는다

> **팁**: 예쁘게 그릴 필요 없다. 네모 몇 개와 화살표면 충분하다. 못 그리는 것이 정상이다.
> 

---

### AI 디자인 도구 비교

지금부터 사용할 도구들을 정리한다. 이 수업에서는 Tier 1 도구만 필수이다.

**표 7.5** AI 디자인 도구 비교

| 도구 | 비용 | 입력 | 출력 | 용도 |
| --- | --- | --- | --- | --- |
| **Copilot** | 학생 무료 | 스케치/스크린샷 + 프롬프트 | React+Tailwind | **필수** — 스케치→코드, 코드 생성 |
| **v0 by Vercel** | 무료 7-15회/월 | 텍스트 프롬프트 | React+Tailwind+shadcn | **필수** — 프로토타입 생성 |
| **shadcn/ui** | 무료 OSS | CLI 명령어 | 컴포넌트 코드 | **필수** — 컴포넌트 시스템 |

### 7.4.3 Copilot Vision — 스케치를 코드로 변환하기

Copilot은 **이미지를 이해하는 기능**(Copilot Vision)을 제공한다. Copilot Chat에 이미지를 첨부하면, AI가 그림을 분석하여 코드를 생성한다. 2026년 현재 Copilot의 주력 모델(GPT-4o, Claude 3.5 Sonnet, Gemini 등)은 이미지를 정확히 분석하여 코드로 변환해 준다.

**사용 방법**:

1. 종이 스케치를 촬영한다 (스마트폰 카메라)
2. Copilot Chat 패널을 연다
3. 이미지를 채팅창에 **드래그 앤 드롭** 또는 첨부한다
4. 프롬프트를 함께 입력한다

> [버전 고정] Next.js 16.2.1, React 19.2.4, Tailwind CSS 4, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2 기준으로 작성해줘.
[규칙] App Router만 사용하고 next/router, pages router, 구버전 API는 사용하지 마.
[검증] 불확실하면 현재 프로젝트 package.json 기준으로 버전을 먼저 확인하고 답해줘.
"이 손그림 스케치를 Next.js + Tailwind CSS 컴포넌트로 변환해줘.
App Router 구조를 사용하고, 레이아웃은 스케치와 최대한 비슷하게 만들어줘.
색상은 아직 정하지 않았으니 gray 계열로 기본 처리해줘."
> 

### 7.4.4 v0로 프로토타입 생성하고 프로젝트에 통합하기

**v0**(v0.dev)는 Vercel이 만든 AI 프로토타입 도구이다. 텍스트 프롬프트를 입력하면 **React + Tailwind CSS + shadcn/ui** 기반의 프로토타입을 즉시 생성한다.

**왜 v0인가**: 이미 Vercel을 사용 중이므로 별도 계정이 필요 없다. 무료 티어(월 7-15회)로 충분하며, 출력이 Next.js + shadcn/ui 네이티브 코드이므로 프로젝트에 바로 통합할 수 있다.

**사용 방법**:

1. 웹사이트 접속: 브라우저 주소창에 `https://v0.dev`를 입력하여 접속합니다.
2. 로그인: 오른쪽 상단의 'Login' 버튼을 누릅니다. v0는 Vercel에서 만든 도구이므로, Vercel 계정(보통 GitHub 계정과 연동됨)으로 로그인하시면 됩니다.
3. 사용 방법: 메인 화면의 입력창에 원하는 UI 디자인을 한글이나 영어 프롬프트로 입력하면 AI가 즉시 React(Next.js) + Tailwind CSS + shadcn/ui 기반의 코드를 생성해 줍니다.
4. 프로젝트 통합: `npx v0 add [URL]` 명령어로 프로젝트에 통합합니다.

---

## 7.5 shadcn/ui로 컴포넌트 시스템 구축하기

### 7.5.1 shadcn/ui란: 복사해서 쓰는 컴포넌트 라이브러리

**shadcn/ui**는 일반적인 npm 패키지가 아니다. `npm install`로 설치하는 것이 아니라, **컴포넌트 코드를 프로젝트에 직접 복사**한다. 복사된 코드는 내 프로젝트의 일부가 되므로 자유롭게 수정할 수 있다.

왜 바이브코딩 교재에서 shadcn/ui를 사용하는가:

- **코드가 내 프로젝트에 있으므로** AI가 코드를 읽고 수정할 수 있다 (블랙박스가 아니다)
- v0, Bolt, Lovable 등 **주요 AI 도구들이 모두 shadcn/ui 기반**이다
- Tailwind CSS + **Radix UI**(접근성 보장) 조합이다
- 복사된 코드를 열어서 **"이 버튼이 어떻게 동작하는지"** 직접 읽을 수 있다

> **팁**: npm 패키지는 node_modules 안에 숨어 있어서 코드를 보기 어렵다. 반면 shadcn/ui는 내 components/ui/ 폴더에 코드가 그대로 복사된다. 직접 수정할 수 있다는 뜻이다.
> 

### 7.5.2 npx shadcn init -- 프로젝트에 설치하기

> **실습 안내**: 안내 순서에 따라 명령을 실행한다.
> 

```bash
npx shadcn@latest init
```

설치 중 선택 항목:

**표 7.6** shadcn/ui 초기화 옵션

| 질문 | 권장 선택 | 설명 |
| --- | --- | --- |
| Style | new-york | 세련된 기본 스타일 |
| Base color | Slate | 무난한 회색 계열 (나중에 변경 가능) |
| CSS variables | Yes | 테마 커스터마이징에 필수 |

> TailwindCSS v4에서는 `tailwind.config.js` 파일이 더 이상 생성되지 않는다. CSS-first 방식으로, 모든 설정이 `app/globals.css` 안에서 처리된다.
> 

설치 후 **버전 확인** — `@latest`로 설치했으므로 어떤 버전이 설치되었는지 확인하고, copilot-instructions.md를 업데이트한다:

```bash
# components.json에서 shadcn/ui 설정 확인
node -e "const c = require('./components.json'); console.log('style:', c.style, '| tailwind css:', c.tailwind?.css)"
```

copilot-instructions.md의 Tech Stack 섹션에 shadcn/ui 사용 사실을 추가한다:

```markdown
## Tech Stack

- shadcn/ui (components/ui/ 경로에 설치됨)
```

설치 후 생성되는 파일:

```
프로젝트/
├── components/
│   └── ui/              ← shadcn/ui 컴포넌트가 여기에 복사됨
├── components.json      ← shadcn/ui 설정 파일
├── lib/
│   └── utils.ts         ← cn() 유틸리티 함수
└── app/
    └── globals.css      ← CSS 변수 (디자인 토큰) + @theme inline 블록
```

### 7.5.3 핵심 컴포넌트 추가: Button, Card, Input, Dialog

> **실습 안내**: 컴포넌트 4개를 한 번에 추가한다.
> 

```bash
npx shadcn@latest add button card input dialog
```

**표 7.7** shadcn/ui 핵심 컴포넌트

| 컴포넌트 | 용도 | 블로그 활용 예시 |
| --- | --- | --- |
| **Button** | 버튼 (variant: default, outline, ghost 등) | 글쓰기, 로그인, 삭제 |
| **Card** | 콘텐츠 카드 (Header, Content, Footer) | 포스트 카드 |
| **Input** | 텍스트 입력 필드 | 검색, 제목 입력 |
| **Dialog** | 모달 대화상자 | 삭제 확인, 로그인 안내 |

**코드 읽기 -- Button 컴포넌트**:

```tsx
// components/ui/button.tsx (shadcn/ui가 복사한 코드)
import { cn } from "@/lib/utils";

// variant별로 다른 스타일이 적용된다
// "default" → bg-primary text-primary-foreground
// "outline" → border border-input bg-background
// "ghost"   → hover:bg-accent
```

사용 예시:

```jsx
import { Button } from "@/components/ui/button"

<Button>기본 버튼</Button>
<Button variant="outline">외곽선 버튼</Button>
<Button variant="ghost">투명 버튼</Button>
```

### 7.5.4 테마 커스터마이징: CSS 변수로 디자인 토큰 설정

shadcn/ui의 모든 스타일은 `app/globals.css`의 **CSS 변수**로 제어된다. 이 변수들을 **디자인 토큰**(Design Token)이라 한다.

**표 7.8** 주요 디자인 토큰

| 토큰 | CSS 변수 | 역할 |
| --- | --- | --- |
| 배경색 | `--background` | 페이지 전체 배경 |
| 텍스트색 | `--foreground` | 기본 텍스트 색상 |
| 주요색 | `--primary` | 주요 버튼, 링크 색상 |
| 보조색 | `--secondary` | 보조 버튼, 배지 |
| 강조색 | `--accent` | 호버 효과, 강조 영역 |
| 테두리 | `--border` | 카드, 입력 필드 테두리 |
| 둥글기 | `--radius` | 모서리 반경 |

**TailwindCSS v4의 테마 구조**: `globals.css`에는 CSS 변수 정의와 함께 `@theme inline` 블록이 있다. 이 블록이 Tailwind 유틸리티 클래스와 CSS 변수를 연결한다:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... */
}
```

`@theme inline` 블록 덕분에 `bg-primary`, `text-foreground` 같은 Tailwind 유틸리티 클래스를 사용할 수 있다. `tailwind.config.js` 없이 CSS 파일 하나로 모든 설정이 완결된다.

**색상 팔레트 변경하기**: shadcn/ui 공식 사이트([ui.shadcn.com/themes](http://ui.shadcn.com/themes))에서 테마를 선택하면 CSS 변수 코드를 복사할 수 있다. `globals.css`의 `:root` 부분을 교체하면 전체 테마가 바뀐다.

> **실습 안내**: shadcn/ui 테마 페이지에서 색상을 선택해 `globals.css`에 적용한다.
> 

---

## 7.6 디자인 프롬프트 전략 -- AI에게 "우리 디자인"을 가르치기

### 7.6.1 디자인 토큰이란: 색상, 타이포그래피, 간격의 체계화

**디자인 토큰**(Design Token)은 색상, 폰트, 간격 등 디자인 규칙을 변수로 정리한 것이다. 쉽게 말해서 **"우리 앱의 디자인 규칙집"**이다.

디자인 토큰이 없으면:

- AI가 매번 다른 색상을 사용한다 (`blue-500`, `indigo-600`, `sky-400`...)
- 페이지마다 간격이 다르다 (`p-4`, `p-6`, `p-8`...)
- 일관성 없는 UI가 만들어진다

디자인 토큰이 있으면:

- AI가 **정해진 색상만** 사용한다 (primary, secondary, accent)
- 모든 페이지에서 **동일한 간격 규칙**을 따른다
- 일관된 UI가 유지된다

### 7.5.2 copilot-instructions.md에 디자인 규칙 추가하기

2장에서 작성한 `.github/copilot-instructions.md`에 **Design Tokens** 섹션을 추가한다:

```markdown
## Design Tokens

- Primary color: shadcn/ui --primary (어두운 파란색 계열)
- Background: --background (흰색)
- Card: shadcn/ui Card 컴포넌트 사용 (rounded-lg shadow-sm)
- Spacing: 컨텐츠 간격 space-y-6, 카드 내부 p-6
- Max width: max-w-4xl mx-auto (메인 컨텐츠)
- 반응형: md 이상 2열 그리드, 모바일 1열

## Component Rules

- UI 컴포넌트는 shadcn/ui 사용 (components/ui/)
- Button, Card, Input, Dialog 등 shadcn/ui 컴포넌트 우선
- 커스텀 컴포넌트는 components/ 루트에 배치
- Tailwind 기본 컬러 직접 사용 금지 → CSS 변수(디자인 토큰) 사용
```

### 7.6.3 효과적인 디자인 프롬프트 5가지 전략

**표 7.9** 디자인 프롬프트 5가지 전략

| # | 전략 | 설명 | 예시 |
| --- | --- | --- | --- |
| 1 | **레퍼런스 제시** | 참고할 UI/사이트 이름을 명시한다 | "Notion 스타일의 사이드바" |
| 2 | **제약 조건 명시** | 사용할 컴포넌트, 색상 등을 제한한다 | "shadcn/ui Card만 사용, primary 색상 위주" |
| 3 | **반복 다듬기** | 한 번에 완성하지 않고 단계적으로 수정한다 | "간격을 더 넓게" -> "폰트를 키워줘" |
| 4 | **부정 프롬프트** | 하지 말아야 할 것을 명시한다 | "그라디언트 사용 금지, 그림자 최소화" |
| 5 | **역할 부여** | AI에게 디자인 역할을 지정한다 | "미니멀리스트 UI 디자이너로서 답변해줘" |

### 7.6.4 좋은 디자인 프롬프트 vs 나쁜 디자인 프롬프트

**표 7.10** 좋은 vs 나쁜 디자인 프롬프트

| 항목 | 나쁜 프롬프트 | 좋은 프롬프트 |
| --- | --- | --- |
| 색상 | "예쁜 색으로 해줘" | "shadcn/ui 디자인 토큰 사용, primary 버튼은 --primary, 배경은 --background" |
| 레이아웃 | "깔끔하게 배치해줘" | "2열 그리드(md:grid-cols-2), gap-6, max-w-4xl mx-auto" |
| 컴포넌트 | "카드로 만들어줘" | "shadcn/ui Card 사용, CardHeader에 제목+Badge, CardContent에 본문, CardFooter에 작성일+작성자" |
| 반응형 | "모바일에서도 보이게" | "md 이상 2열, sm 이하 1열 스택. 네비게이션은 모바일에서 햄버거 메뉴" |

---

## 7.7 설계서를 AI 컨텍스트로 통합하기

### 7.7.1 데이터 모델 설계: 테이블 구조 미리 잡기 (Supabase 대비)

다음 장(Ch8)에서 Supabase 데이터베이스를 연결한다. 그때 테이블을 만들려면 **어떤 데이터가 필요한지** 지금 정리해야 한다.

블로그 앱의 데이터 모델:

```
users (사용자)
├── id: UUID (자동 생성)
├── email: 이메일
├── name: 이름
├── avatar_url: 프로필 이미지 URL
└── role: 역할 ('user', 'admin')

posts (포스트)
├── id: UUID (자동 생성)
├── title: 제목
├── content: 본문
├── author_id: 작성자 (→ users.id)
└── created_at: 작성일시 (자동 생성)
```

대부분의 웹앱은 **사용자 역할(role)**이 필요하다. 일반 사용자와 관리자(admin)처럼 역할에 따라 접근 가능한 페이지와 수행 가능한 작업이 달라진다. `role` 컬럼은 Ch9(인증)에서 프로필 조회에 활용하고, Ch11(RLS)에서 역할 기반 접근 제어에 사용한다.

**테이블 관계**: 한 명의 사용자(users)가 여러 개의 블로그 글(posts)을 작성할 수 있다 → **1:N 관계**. `posts.author_id`가 `users.id`를 참조한다.

### 7.7.2 [ARCHITECTURE.md](http://architecture.md/) — 프로젝트별 설계 문서

앞서 7.2절에서 **모든 프로젝트에 공통으로 사용하는 범용 파일 3종** ([copilot-instructions.md](http://copilot-instructions.md/), [context.md](http://context.md/), [todo.md](http://todo.md/))을 배웠다.

이번에는 **이 블로그 프로젝트만의 설계 문서**인 `ARCHITECTURE.md`를 작성한다. 이 파일은 범용 파일과 달리 **프로젝트별로 다른 내용**을 담는다.

**범용 vs 프로젝트별 비교:**

| 구분 | 범용 파일 (7.2절) | 프로젝트별 파일 (지금) |
| --- | --- | --- |
| 예시 | [copilot-instructions.md](http://copilot-instructions.md/), [context.md](http://context.md/), [todo.md](http://todo.md/) | [ARCHITECTURE.md](http://architecture.md/) |
| 범위 | 모든 프로젝트 | 이 블로그만 |
| 내용 | 코딩 규칙, 작업 상태, 할 일 | 페이지 맵, 컴포넌트 계층, 데이터 모델 |
| 재사용 | 다른 프로젝트에도 같은 방식 사용 | 프로젝트마다 별도 작성 |

설계 내용을 하나의 문서로 정리한다. 프로젝트 루트에 `ARCHITECTURE.md`를 생성한다:

```markdown
# Architecture

## Page Map

- / — 홈
- /about — 블로그 소개
- /posts — 포스트 목록
- /posts/new — 포스트 작성
- /posts/[id] — 포스트 상세
- /login — 로그인
- /signup — 회원가입
- /mypage — 마이페이지

## User Flow

- 글 읽기: 홈 → 포스트 목록 → 카드 클릭 → 포스트 상세
- 글 쓰기: 포스트 목록 → 글쓰기 → (로그인 필요 시 리다이렉트) → 작성 → 제출 → 상세
- 마이페이지: 로그인 → 마이페이지 → 내 포스트 목록 → 수정/삭제

## Component Hierarchy

Layout
├── Header (네비게이션: 로고, 포스트, 소개, 로그인/마이페이지)
├── Main
│ ├── PostList (포스트 카드 목록)
│ ├── PostDetail (포스트 상세)
│ ├── PostForm (포스트 작성 폼)
│ ├── LoginPage (로그인)
│ ├── MyPage (내 포스트)
└── Footer

## Data Model

- users: id, email, name, avatar_url, role ('user'|'admin')
- posts: id, title, content, author_id (→ users.id), created_at

## Design Tokens

- Primary: #8B6B4E (warm ivory)
- Background: #FBF8F3
- Components: shadcn/ui (Button, Card, Input, Dialog, Avatar, Badge)
- Layout: max-w-4xl mx-auto, space-y-6
- Responsive: md:grid-cols-2, 모바일 1열
```

### 7.7.3 AI 생성 디자인 검증 체크리스트

**표 7.10** AI 디자인 검증 체크리스트

| # | 검증 항목 | 확인 내용 | 확인 방법 |
| --- | --- | --- | --- |
| 1 | **반응형** | 모바일(375px), 태블릿(768px), 데스크톱(1280px)에서 깨지지 않는가? | DevTools -> 반응형 모드 (Ctrl+Shift+M) |
| 2 | **접근성** | 이미지에 alt, 버튼에 의미 있는 텍스트, 충분한 색상 대비가 있는가? | Lighthouse -> 접근성 점수 |
| 3 | **일관성** | 모든 페이지에서 동일한 디자인 토큰을 사용하는가? | 육안 비교 |
| 4 | **컴포넌트** | shadcn/ui 컴포넌트를 올바르게 import하고 사용했는가? | `@/components/ui/` 경로 확인 |
| 5 | **네비게이션** | 모든 페이지 간 이동이 페이지 맵과 일치하는가? | 직접 클릭하며 테스트 |
| 6 | **코드 구조** | 컴포넌트가 ARCHITECTURE.md의 계층과 일치하는가? | 파일 구조 비교 |

### 7.7.4 설계 문서를 참조하여 AI에게 코드 생성 지시하기

ARCHITECTURE.md와 copilot-instructions.md가 준비되었으면, Copilot에게 프로젝트 파일을 참조하여 설계 기반으로 코드를 생성하도록 지시한다:

> [버전 고정] Next.js 16.2.1, React 19.2.4, Tailwind CSS 4, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2 기준으로 작성해줘.
[규칙] App Router만 사용하고 next/router, pages router, 구버전 API는 사용하지 마.
[검증] 불확실하면 현재 프로젝트 package.json 기준으로 버전을 먼저 확인하고 답해줘.
"ARCHITECTURE.md의 Page Map과 Component Hierarchy를 참고해서,
app/posts/page.tsx에 포스트 목록 페이지를 만들어줘.
PostList 컴포넌트는 shadcn/ui Card를 사용하고,
디자인 토큰은 copilot-instructions.md의 Design Tokens 섹션을 따라줘."
> 

핵심은 **프로젝트의 설계 파일을 참조하도록 지시하는 것**이다. AI가 프로젝트 전체 파일을 탐색하여 설계 의도에 맞는 코드를 생성한다.

---

### AI가 자주 틀리는 디자인 패턴

**표 7.12** AI가 자주 틀리는 디자인 패턴

| AI 실수 | 올바른 방법 | 이유 |
| --- | --- | --- |
| Tailwind 색상 직접 사용 (`bg-blue-500`) | 디자인 토큰 사용 (`bg-primary`) | 테마 변경 시 전체 수정 필요 |
| 반응형 클래스 누락 | `md:grid-cols-2` 등 브레이크포인트 지정 | 모바일에서 레이아웃 깨짐 |
| shadcn/ui import 경로 오류 | `@/components/ui/button` 실제 경로 확인 | 환각 -- 존재하지 않는 경로 |
| 이미지에 `alt` 속성 누락 | `<img alt="설명" />` 필수 | 접근성 위반 |
| 하드코딩된 색상값, 간격 | CSS 변수 또는 Tailwind 유틸리티 사용 | 디자인 토큰과 불일치 |
| 불필요한 `"use client"` 추가 | Server Component가 기본 -- 필요할 때만 추가 | Ch6에서 배운 원칙 위반 |

---

## 핵심 정리 + B회차 과제 스펙

### 이번 시간 핵심 4가지

1. **AI 슬롭** 방지: 설계서를 먼저 작성하고 AI에게 제공하면 의도에 맞는 결과물이 나온다
2. **shadcn/ui**: 코드를 프로젝트에 복사하는 컴포넌트 라이브러리 + CSS 변수로 테마 커스터마이징
3. **범용 vs 프로젝트별**: copilot-instructions/context/todo는 모든 프로젝트 공통, ARCHITECTURE.md는 프로젝트별
4. **세션 간 연속성**: [context.md](http://context.md/)(상태) + [todo.md](http://todo.md/)(할 일)로 Copilot의 기억 한계를 보완한다

### B회차 과제 스펙

**과제 내용**: Ch1~6에서 만든 **블로그의 아키텍처 설계서**를 보강한다.

설계서에 shadcn/ui 컴포넌트 시스템, 디자인 토큰, DB 스키마 계획을 추가한다. Ch8~12에서 배울 Supabase CRUD, 인증, RLS를 활용할 수 있는 구조로 설계해야 한다.

**제출물**:

1. 페이지 맵 (최소 4페이지, URL 구조 포함)
2. AI 와이어프레임 (Copilot Vision 또는 v0로 생성, 2장 이상)
3. shadcn/ui 테마 (npx shadcn init 완료 + 색상 커스터마이징)
4. 데이터 모델 (테이블 2개 이상 + 관계 정의)
5. [copilot-instructions.md](http://copilot-instructions.md/) (Design Tokens + Component Rules 섹션 포함)
6. [ARCHITECTURE.md](http://architecture.md/) (페이지 맵 + 컴포넌트 계층 + 데이터 모델 통합)
7. [context.md](http://context.md/) (프로젝트 초기 상태 기록 — 기술 결정 사항 포함)
8. [todo.md](http://todo.md/) (전체 작업 체크리스트 — 단계별 구분, 진행률 포함)

B회차에서는 Ch6까지 만든 블로그 프로젝트를 이어서 사용한다. 설계서 파일([ARCHITECTURE.md](http://architecture.md/), [context.md](http://context.md/), [todo.md](http://todo.md/))은 프로젝트 루트에 직접 생성한다.