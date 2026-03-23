# A회차: 강의

> **미션**: Copilot을 제대로 세팅하고, AI의 한계를 이해하고, 컨텍스트 관리법을 배운다
> 

---

## 학습목표

1. 바이브코딩의 원리(설명 → 생성 → 검증 → 반복)를 설명할 수 있다
2. AI 코딩의 3대 한계(버전 불일치, 컨텍스트 소실, 환각)를 이해하고 대응할 수 있다
3. GitHub Copilot과 Copilot Chat을 설치하고 사용할 수 있다
4. [copilot-instructions.md](http://copilot-instructions.md)를 작성하여 Copilot에게 프로젝트 컨텍스트를 제공할 수 있다
5. AI가 생성한 코드를 검증하는 체크리스트를 활용할 수 있다

---

---

## 오늘의 미션 + 빠른 진단

> **오늘의 질문**: "AI가 만든 코드를 그대로 사용해도 될까? AI 코드의 가장 큰 위험은 무엇인가?"
> 

**빠른 진단** (1문항):

AI가 `npm install super-auth-helper`를 추천했다. 가장 먼저 해야 할 일은?

- (A) 바로 설치한다 — AI가 추천했으니 안전하다
- (B) [npmjs.com](http://npmjs.com)에서 해당 패키지가 존재하는지 검색한다
- (C) 설치 후 에러가 나면 그때 삭제한다

정답: (B) — AI는 존재하지 않는 패키지를 추천하기도 한다(환각). 반드시 공식 사이트에서 확인한다.

---

## 2.1 바이브코딩이란

### 2.1.1 AI 시대의 개발 방식 변화

전통적인 개발은 개발자가 모든 코드를 직접 타이핑했다. 문법을 외우고, API 문서를 읽고, 한 줄씩 작성했다.

**바이브코딩**(Vibe Coding)은 다르다. 개발자가 "무엇을 만들고 싶은지"를 AI에게 설명하면, AI가 코드를 생성한다. 개발자의 역할은 코드를 타이핑하는 것에서 **코드를 검증하고 방향을 잡는 것**으로 바뀌었다.

쉽게 말해서, AI가 코드를 쓰고 내가 확인하는 방식이다.

### 2.1.2 바이브코딩의 원리: 설명 → 생성 → 검증 → 반복

바이브코딩은 네 단계를 반복한다:

```
① 설명: 만들고 싶은 것을 명확하게 AI에게 지시한다
② 생성: AI가 코드를 생성한다
③ 검증: 생성된 코드가 올바른지 확인한다
④ 반복: 틀린 부분을 수정 지시하거나, 다음 기능을 요청한다
```

이 중 가장 중요한 단계는 **③ 검증**이다. AI가 만든 코드를 그대로 사용하면 안 된다. 반드시 확인하고, 이해한 뒤 사용한다.

### 2.1.3 기본기가 필요한 이유: AI 출력을 판단하려면

"AI가 코드를 다 만들어주면, 기본기를 왜 배워야 하는가?"

AI가 만든 코드가 **맞는지 틀리는지 판단하려면** 기본기가 필요하다. HTML 구조를 모르면 AI가 잘못된 마크업을 생성해도 알아차리지 못한다. JavaScript를 모르면 에러 메시지를 읽을 수 없다.

비유하자면, 번역기가 아무리 좋아도 원어를 어느 정도 아는 사람이 결과를 더 잘 검증한다. 이 수업에서 3~6장에 걸쳐 HTML, CSS, JavaScript, Next.js 기본기를 배우는 이유가 바로 이것이다.

---

## 2.2 AI 코딩의 3대 한계

AI 코딩 도구는 강력하지만, 반드시 알아야 할 세 가지 한계가 있다. **이것을 모르면 바이브코딩은 실패한다.**

### 2.2.1 한계 1: 버전 불일치

AI는 과거 시점의 데이터로 학습한다. 그런데 라이브러리는 계속 업데이트된다.

**예를 들어**:

- AI가 2025년까지의 코드로 학습했다면, Next.js 14의 문법을 제안한다
- 그런데 `npx create-next-app@latest`로 설치하면 그 시점의 최신 버전이 설치된다
- AI의 학습 데이터와 실제 설치된 버전 사이에 **갭(gap)**이 생긴다
- AI가 제안한 코드를 그대로 쓰면 에러가 난다

이 교재에서 `@latest`를 사용하는 이유가 있다. 특정 버전을 고정하면 교재가 금방 낡는다. `@latest`를 쓰되, **설치 직후 버전을 확인하고 AI에게 알려주는 습관**이 해결책이다.

**실제 사례**:

```jsx
// AI가 제안하는 코드 (Next.js 14 방식 — 틀림)
import { useRouter } from 'next/router';

// 올바른 코드 (App Router 공통)
import { useRouter } from 'next/navigation';
```

`next/router`는 Pages Router(구 방식)의 import 경로이다. App Router에서는 `next/navigation`을 써야 한다. AI는 이 차이를 모르고 옛날 코드를 제안하는 경우가 많다.

### 2.2.2 한계 2: 컨텍스트 소실

AI에게는 **장기 기억이 없다**. 채팅 세션이 끝나면 이전 대화를 모두 잊는다.

구체적으로:

- **세션 간 기억 없음**: 어제 나눠 대화를 오늘은 모른다
- **열린 파일 위주**: 프로젝트에 파일이 20개 있어도, 열려 있는 파일만 참고한다
- **설계 의도를 모른다**: "왜 이 컴포넌트를 이렇게 만들었는지" 모른 채 코드를 생성한다

결과적으로 AI는 프로젝트의 일부분만 보고 코드를 만든다. 전체 구조와 맞지 않는 코드를 생성하거나, 이미 있는 기능을 다시 만들거나, 일관성 없는 스타일로 코드를 작성한다.

### 2.2.3 한계 3: 환각

**환각**(Hallucination)은 AI가 **존재하지 않는 것을 만들어내는 현상**이다. 이것이 가장 위험하다.

**표 2.2** 환각의 유형

| 유형 | 예시 |
| --- | --- |
| 가짜 API | `supabase.from('posts').upsertMany(\[...\])` — 없는 메서드 |
| 가짜 설정 | `next.config.js`에 존재하지 않는 설정 키 |

AI는 이런 가짜 코드를 **자신 있는 말투로** 제시한다. 더 위험한 경우는 **비슷한 이름의 악성 패키지**가 존재하는 경우이다. 이를 **타이포스쿠팅**(Typosquatting)이라 한다.

### 2.2.4 3대 한계의 관계

```
버전 불일치 + 컨텍스트 부족 → 환각 확률 증가
```

AI가 현재 버전을 모르고, 프로젝트 맥락도 모르면, 그럴듯하지만 틀린 코드를 만들어낼 확률이 높아진다.

---

## 2.3 GitHub Copilot 설정

> **실습 안내**: 안내 순서에 따라 GitHub Copilot 확장을 설치한다.
> 

**③ Copilot Pro 무료 활성화**

Student Pack 승인 후 Copilot을 별도로 활성화해야 한다:

1. https://github.com/settings/copilot 접속
2. **"Get access to GitHub Copilot"** 버튼을 클릭하여 무료 활성화

> **주의**: 이 과정에서 **신용카드 입력이 요구되면 진행하지 않는다**. 학생 혜택은 완전 무료이다.
> 

**트러블슈팅**:

- 승인 후 혜택이 안 보이면: 72시간 대기 후 로그아웃/재로그인 시도
- 인증 실패 시: 학생증 사진을 수동으로 업로드하거나 GitHub Support([https://support.github.com/contact/education)에](https://support.github.com/contact/education)에)에) 티켓 제출

> **무료 대안 — Codeium(Windsurf)**: Copilot 승인 대기 중이라면 **Codeium**을 임시로 사용할 수 있다. VS Code 확장 마켓에서 "Codeium" 또는 "Windsurf"를 검색하여 설치하면 무료로 코드 자동완성 기능을 사용할 수 있다.
> 

### 2.3.2 VS Code Copilot / Copilot Chat 확장 설치

VS Code에서 다음 두 확장을 설치한다:

**표 2.3** Copilot 확장 설치

| 확장명 | 용도 |
| --- | --- |
| GitHub Copilot Chat | 대화형 코드 생성 (채팅 패널) |

설치 후 VS Code 오른쪽 하단에 Copilot 아이콘이 나타나면 성공이다.

> **트러블슈팅**: 아이콘이 안 나오면 VS Code 재시작. 로그인 실패 시 GitHub 토큰 재인증.
> 

### 2.3.3 Copilot 자동완성: Tab 수락, 주석으로 의도 전달

Copilot의 가장 기본적인 기능은 **자동완성**이다. 코드를 타이핑하면 회색 글씨로 제안이 나타나고, `Tab`을 누르면 수락된다.

주석으로 의도를 전달하면 더 정확한 제안을 받을 수 있다:

```jsx
// 현재 날짜를 "2026년 2월 7일" 형식으로 반환하는 함수
```

**표 2.4** Copilot 자동완성 단축키

| 단축키 (Windows) | 단축키 (macOS) | 기능 |
| --- | --- | --- |
| `Esc` | `Esc` | 제안 거부 |
| `Alt + \[` | `Option + \[` | 이전 제안 보기 |

### 2.3.4 Copilot Chat: @workspace, /explain, /fix, Ctrl+I

**표 2.5** Copilot Chat 주요 명령어

| 명령어 | 용도 | 예시 |
| --- | --- | --- |
| `/explain` | 선택한 코드 설명 | 코드 선택 후 `/explain` |
| `Cmd + I` | 인라인 편집 | 코드 위에서 직접 수정 지시 |

### 좋은 프롬프트 vs 나쁜 프롬프트

같은 기능을 요청하더라도 **프롬프트의 구체성**에 따라 결과가 크게 달라진다:

> **나쁜 프롬프트**
> 

> "네비게이션 바 만들어줘"
> 

→ 기술 스택 불명, 디자인 불명, 프로젝트 맥락 없음. AI가 임의로 CSS 방식, 구조, 스타일을 결정한다.

> **좋은 프롬프트**
> 

> "Next.js App Router 프로젝트의 app/layout.js에 네비게이션 바를 추가해줘.
> 

> Tailwind CSS로 스타일링하고, 왼쪽에 사이트 제목 '블로그', 오른쪽에 '글 목록'과 '로그인' 링크를 배치해줘.
> 

> 모바일에서는 가로로 쌍이지 않도록 flex-wrap 처리해줘."
> 

→ 기술 스택, 파일 위치, 구체적 요구사항이 명확하다. AI가 정확한 코드를 생성할 확률이 높다.

**핵심 원칙**: 프롬프트에 **① 기술 스택** + **② 파일 위치** + **③ 구체적 요구사항**을 포함한다.

---

## 2.4 컨텍스트 관리 3계층

> **라이브 코딩 시연**: [copilot-instructions.md](http://copilot-instructions.md)를 작성하고, Copilot에게 블로그 소개 페이지를 생성시키는 과정을 시연한다.
> 

### 2.4.1 1계층 — [copilot-instructions.md](http://copilot-instructions.md) (필수)

> **실습 안내**: `copilot-instructions.md` 파일을 직접 작성하고 체크리스트를 채운다.
> 

**컨텍스트 문제의 80%를 해결하는 핵심 파일**이다.

`.github/copilot-instructions.md`는 Copilot이 **매 세션마다 자동으로 읽는** 프로젝트 지시 파일이다.

**생성 방법** (터미널):

```bash
mkdir -p .github
```

VS Code에서 `.github/copilot-instructions.md` 파일을 생성하고 아래 내용을 작성한다:

```markdown
# Project Context

## Tech Stack (⚠️ package.json에서 확인한 실제 버전을 기입)
- Next.js [여기에 실제 버전 — 예: 15.1.2] (App Router ONLY — Pages Router 사용 금지)
- Tailwind CSS [여기에 실제 버전 — 예: 4.0.6]
- Vercel 배포

## Coding Conventions
- Server Component 기본, "use client"는 필요할 때만
- async/await 패턴 (then 체이닝 금지)
- Tailwind CSS 유틸리티 클래스만 사용

## Known AI Mistakes (DO NOT)
- next/router 사용 금지 → next/navigation 사용
- getServerSideProps 사용 금지 → App Router 서버 컴포넌트 사용
- @supabase/auth-helpers 사용 금지 → @supabase/ssr 사용
- CSS Modules, styled-components 사용 금지
```

> **핵심**: `\[여기에 실제 버전\]` 부분을 Ch1에서 확인한 **실제 설치 버전**으로 교체한다. `15.x`처럼 대략적으로 쓰지 말고, `15.1.2`처럼 정확히 기입한다. AI는 정확한 버전을 알아야 해당 버전의 API를 제안한다.
> 

**"Known AI Mistakes" 섹션이 핵심이다.** AI가 자주 틀리는 패턴을 미리 명시하면 같은 실수를 피하도록 유도할 수 있다. 이 섹션은 수업이 진행되면서 계속 추가한다.

**수정 예시** — AI가 `next/router`를 쓴 코드를 생성했을 때, Copilot Chat에 다음과 같이 요청한다:

> "`.github/copilot-instructions.md`의 Known AI Mistakes 섹션에 항목을 추가해줘:
> 

> `params를 동기로 읽지 말 것 → async/await로 처리`"
> 

Copilot이 파일을 직접 수정해준다. 확인 후 저장(`Cmd+S`)하면 끝이다.

### 2.4.2 2계층 — 프로젝트 구조 파일 + @workspace (권장)

[copilot-instructions.md](http://copilot-instructions.md)가 "규칙"을 알려준다면, 프로젝트 구조 파일은 "맥락"을 제공한다.

**@workspace 명령어**를 사용하면 Copilot이 프로젝트 전체를 탐색한 뒤 대답한다:

> [ubc84uc804 uace0uc815] Next.js 14.2.21, React 18.3.1, Tailwind CSS 3.4.17, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2 기준으로 작성해줘.
> 

> [uaddcuce59] App Router만 사용하고 next/router, pages router, 구버전 API는 사용하지 마.
> 

> [uac80uc99d] 불확실하면 현재 프로젝트 package.json 기준으로 버전을 먼저 확인하고 답해줘.
> 

> "@workspace 현재 프로젝트의 페이지 구조를 파악하고, 새로운 /about 페이지를 추가해줘"
> 

@workspace 없이 질문하면 열린 파일만 참고한다. @workspace를 붙이면 프로젝트 전체를 스캔한다.

### 2.4.3 3계층 — MCP로 외부 지식 연결 (권장)

**MCP**(Model Context Protocol)는 AI에게 외부 도구를 연결하는 방법이다. **Context7** MCP를 사용하면 Copilot이 공식 문서를 실시간으로 참조할 수 있다.

Context7 MCP는 **버전 불일치 문제의 핵심 해결 도구**이다. [copilot-instructions.md](http://copilot-instructions.md)가 "규칙"을 알려준다면, Context7은 **최신 공식 문서**를 실시간으로 제공한다. 예를 들어 Next.js의 `params` 처리 방식이 바뀌었을 때, AI가 Context7을 통해 현재 공식 문서를 참조하면 올바른 코드를 생성할 확률이 크게 높아진다.

> MCP 초기 설정은 한 번만 하면 된다. 자세한 방법은 부록 C를 참고한다. **설정이 가능한 학생은 적극 권장한다.**
> 

### 2.4.4 package.json 버전 고정

수강생 전원이 **같은 버전**을 사용해야 같은 결과를 얻을 수 있다.

```bash
npm ci
```

**표 2.6** npm 설치 명령어 비교

| 명령어 | 동작 | 용도 |
| --- | --- | --- |
| `npm ci` | 정확한 버전 설치 | 버전 통일 (수업용) |

---

## 2.5 환각 검증법

### 2.5.1 환각을 의심해야 하는 순간

- 처음 보는 **패키지명**이 나올 때
- 검색해도 **공식 문서에 나오지 않는 API**일 때
- 코드가 **너무 깔끔하게** 한 번에 동작하는 것처럼 보일 때

### 2.5.2 패키지 검증

AI가 새로운 패키지를 추천하면, **설치 전에 반드시 확인**한다:

1. https://www.npmjs.com 에서 패키지명 검색

**표 2.7** 패키지 검증 체크리스트

| 확인 항목 | 안전 기준 |
| --- | --- |
| 주간 다운로드 수 | 최소 수천 이상 |
| GitHub 저장소 | 링크가 있고, 실제 코드가 존재 |

### 2.5.3 코드 검증 체크리스트

**표 2.8** AI 코드 검증 체크리스트

| # | 확인 항목 | 확인 방법 | 1 | import 경로가 실제 존재하는가? | 파일 경로 클릭하여 이동 확인 |
| --- | --- | --- | --- | --- | --- |
| 2 | 사용한 함수/메서드가 공식 API에 있는가? | 공식 문서 검색 | 3 | 환경변수가 하드코딩되어 있지 않은가? | API 키가 코드에 직접 노출되면 안 됨 |
| 4 | 에러 처리가 있는가? | try-catch 또는 에러 상태 확인 | 5 | 현재 버전의 문법을 사용하는가? | [copilot-instructions.md](http://copilot-instructions.md)와 대조 |

이 체크리스트는 앞으로 **매 실습마다** 사용한다.

### 2.5.4 환각 발견 시 대응

1. AI에게 **"이 API의 공식 문서 출처를 알려줘"**라고 요청한다
2. 올바른 API를 직접 찾아 수정한다
3. [**copilot-instructions.md](http://copilot-instructions.md)의 "Known AI Mistakes"에 추가**한다

---

## 2.6 종합 대응 워크플로우

AI가 틀렸을 때 다음 순서로 대응한다:

```
① 환각 체크   — 패키지/API/옵션이 실존하는가?
      ↓
② 버전 체크   — copilot-instructions.md에 버전과 패턴이 명시되어 있는가?
      ↓
③ 컨텍스트 체크 — @workspace로 프로젝트 맥락을 다시 제공
      ↓
④ 외부 검증   — MCP 또는 공식 문서에서 직접 검색
      ↓
⑤ 해결 후     — copilot-instructions.md에 새 규칙 추가
```

**⑤번이 가장 중요하다.** AI는 기억하지 못하지만, [copilot-instructions.md](http://copilot-instructions.md)는 기억한다.

---

## 2.7 Agent Mode와 Agent Skills

### 2.7.1 Agent Mode: AI가 스스로 계획하고 실행하기

Copilot Chat 상단에는 세 가지 모드가 있다: **Ask**, **Edit**, **Agent**. 지금까지 사용한 것은 Ask/Edit 모드이다.

**Agent Mode**는 Copilot이 여러 단계의 작업을 **스스로 계획하고 실행**하는 모드이다. 파일을 탐색하고, 코드를 수정하고, 터미널 명령어까지 실행한다.

**표 2.9** Copilot Chat 모드 비교

| 모드 | 동작 | 예시 | **Ask** | 질문에 답변 (코드 수정 안 함) | "이 함수가 뭘 하는 거야?" |
| --- | --- | --- | --- | --- | --- |
| **Edit** | 선택한 코드만 수정 | 코드 선택 → "TypeScript로 변환해줘" | **Agent** | 여러 파일 탐색 + 코드 생성/수정 + 터미널 실행 | "게시글 CRUD API를 만들어줘" |

Agent Mode에서는 **컨텍스트 관리가 더욱 중요**하다. AI가 여러 파일을 동시에 수정하므로, [copilot-instructions.md](http://copilot-instructions.md)에 규칙이 명확히 정의되어 있어야 한다.

### 2.7.2 Agent Skills: 특정 작업에 전문 규칙 자동 적용

**Agent Skills**는 [copilot-instructions.md](http://copilot-instructions.md)의 진화형이다. [copilot-instructions.md](http://copilot-instructions.md)가 "모든 상황에 적용되는 일반 규칙"이라면, Skills는 **"특정 키워드가 포함될 때만 자동 발동되는 전문 규칙"**이다.

**표 2.10** [copilot-instructions.md](http://copilot-instructions.md) vs Agent Skills

| 항목 | [copilot-instructions.md](http://copilot-instructions.md) | Agent Skills |
| --- | --- | --- |
| 적용 시점 | 항상 (모든 프롬프트) | 관련 키워드 포함 시 자동 |
| 난이도 | 마크다운 작성 | 동일 (마크다운 작성) |

**Skills 폴더 구조**:

```
프로젝트/
├── .github/
│   ├── copilot-instructions.md   ← 프로젝트 전체 규칙 (2.4에서 작성)
│   └── skills/                   ← Agent Skills 폴더
│       └── nextjs-rules/
│           └── SKILL.md          ← 스킬 정의 파일
```

[**SKILL.md](http://SKILL.md) 예시** — Next.js 코딩 규칙:

```markdown
---
name: Next.js Best Practices
description: Next.js App Router 프로젝트의 코딩 규칙을 강제합니다.
when: "nextjs", "app router", "server component", "page", "layout" 키워드 포함 시
---

## 규칙
1. App Router 전용 — Pages Router(pages/) 사용 금지
2. Server Component 기본 — "use client"는 useState/onClick 등 필요할 때만
3. next/router 금지 → next/navigation 사용
4. 이미지는 next/image 사용
5. metadata는 export const metadata 또는 generateMetadata() 사용
```

이 파일을 `.github/skills/nextjs-rules/SKILL.md`로 저장하면, Agent 모드에서 "새 페이지 만들어줘"라고 할 때 위 규칙이 **자동으로 적용**된다.

> Skills는 Ch7(디자인 규칙)과 Ch12(에러 처리)에서 실전 예시를 다룬다. 지금은 **"마크다운 파일 하나로 AI의 행동을 제어할 수 있다"**는 개념만 익혀둔다.
> 

### 2.7.3 참고 — MCP: 외부 도구를 AI에 연결하기

> 이 절은 **참고 사항**이다. 수업에서 MCP 설정은 필수가 아니며, 필요한 학생이 개별적으로 활용한다.
> 

**MCP**(Model Context Protocol)는 Copilot Agent 모드에서 **외부 도구, API, 데이터 소스**를 직접 호출할 수 있게 하는 프로토콜이다. Skills가 "규칙을 알려주는 것"이라면, MCP는 **"도구를 쥐어주는 것"**이다.

**표 2.11** Skills vs MCP 비교

| 항목 | Agent Skills | MCP |
| --- | --- | --- |
| 형태 | `.github/skills/` 내 마크다운 | MCP 서버 + `.vscode/mcp.json` 등록 |
| quota 영향 | 소모 적음 | 도구 호출마다 premium request 차감 |

**표 2.12** 웹 개발에 유용한 MCP 서버

| MCP 서버 | 용도 | 설치 방법 | **GitHub MCP** | 리포지토리, 이슈, PR 관리 | `npx -y @modelcontextprotocol/server-github` |
| --- | --- | --- | --- | --- | --- |
| **Playwright MCP** | 브라우저 자동화, E2E 테스트 | MCP Registry에서 "playwright" 검색 | **Context7 MCP** | 최신 공식 문서 실시간 참조 | MCP Registry에서 "context7" 검색 |
| **Chrome DevTools MCP** | 실시간 Chrome 디버깅 | `npx chrome-devtools-mcp@latest` | **Vercel MCP** | 배포, 프리뷰 URL 관리 | MCP Registry에서 "vercel" 검색 |

**MCP 서버 등록 방법** (VS Code):

방법 1 — 명령 팔레트에서 추가: `Cmd+Shift+P` → `MCP: Add Server` → 목록에서 선택

방법 2 — 설정 파일 직접 작성: 프로젝트 루트에 `.vscode/mcp.json` 생성

```json
{
  "mcp": {
    "servers": {
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": { "GITHUB_TOKEN": "${input:github_token}" }
      }
    },
    "inputs": [
      {
        "id": "github_token",
        "type": "promptString",
        "description": "GitHub Personal Access Token"
      }
    ]
  }
}
```

등록 후 VS Code를 재시작하면, Agent 모드에서 `@github` 등의 도구가 사용 가능해진다.

> **quota 주의**: 학생 Pro 계정은 월 300회 premium request가 제한이다. MCP 도구 호출은 이 quota를 소모하므로, 처음에는 **Skills만 사용**하고 MCP는 필요할 때 1~2개만 추가하는 것을 권장한다.
> 

---

## 2.8 AI 사용 로그 작성법

이 수업에서는 **AI 사용 로그**를 기록한다. 기말 프로젝트 필수 제출물이다.

기록 항목:

```
[프롬프트] Tailwind CSS로 반응형 네비게이션 바를 만들어줘
[AI 실수]  next/router를 import함 (Pages Router 문법)
[분류]     버전 불일치
[해결]     next/navigation으로 변경
[조치]     copilot-instructions.md에 "next/router 사용 금지" 추가
```

> 로그 템플릿은 부록 B를 참고한다.
> 

---

## 핵심 정리 + B회차 과제 스펙

### 이번 시간 핵심 3가지

1. **바이브코딩**은 설명 → 생성 → 검증 → 반복이다. 핵심은 **검증**이다
2. AI의 **3대 한계**: 버전 불일치, 컨텍스트 소실, 환각 — [**copilot-instructions.md**](http://copilot-instructions.md)가 80%를 해결한다
3. **Agent Mode + Skills + MCP**: 마크다운 파일로 AI의 행동을 제어하고, 외부 도구를 연결할 수 있다

### B회차 과제 스펙

**Copilot 설정 + 블로그 소개 페이지 생성 + 배포**:

1. GitHub Copilot / Copilot Chat 확장 설치 완료
2. `.github/copilot-instructions.md` 작성 완료
3. Copilot Chat을 사용하여 **블로그 소개 페이지** 생성
4. AI가 생성한 코드를 검증 체크리스트로 확인
5. git push → Vercel 배포
6. AI 사용 로그 작성

B회차에서는 Ch1에서 만든 블로그 프로젝트를 이어서 사용한다.

---

## Exit ticket

[copilot-instructions.md](http://copilot-instructions.md)의 **가장 중요한 섹션**은?

```
(A) Tech Stack
(B) Coding Conventions
(C) Known AI Mistakes (DO NOT)
```

정답: (C) — AI가 자주 틀리는 패턴을 명시하면 같은 실수를 방지할 수 있다. 수업이 진행되면서 이 섹션을 계속 추가하는 것이 핵심이다.

---

## TypeScript 변환 완료 (2026-03-23)

### 이번 변경사항

- 언어 태그: jsx → tsx, javascript → typescript
- 파일 참조: .js/.jsx → .tsx/.ts (모든 React/Next.js 파일)
- 타입 어노테이션: Props 인터페이스, useState 제네릭, 이벤트 타입 추가

### 파일 위치

- docs/ch{N}A.md, docs/ch{N}B.md 모두 업데이트됨
- practice/chapter{N}/ 실습 코드도 TypeScript로 정렬됨

### 검증 방법

1. .tsx 파일들이 생성되었는지 확인
2. package.json의 TypeScript 버전 확인
3. Copilot Chat에서 "@workspace 타입 확인" 실행

## 최근 수정 (2026-03-23)

"수정 방법 (AI에게 시키기)" 섹션의 예제 업데이트

### Copilot 프롬프트 예제 변경

- 이전: `'params를 동기로 읽지 말 것 → async/await로 처리'`
- 현재: `'CSS 파일을 따로 만들지 말 것 → Tailwind CSS 클래스만 사용'`

사유: Ch2 시점의 학생이 이해할 수 있는 더 쉬운 예제로 교체