# Chapter 2. Copilot 세팅과 바이브코딩

> **미션**: Copilot을 세팅하고 AI 한계를 이해한 뒤, 블로그 소개 페이지 생성·검증·배포까지 완료한다
> 

---

## 학습목표

1. 바이브코딩의 원리(설명 → 생성 → 검증 → 반복)를 설명할 수 있다
2. AI 코딩의 3대 한계(버전 불일치, 컨텍스트 소실, 환각)를 이해하고 대응할 수 있다
3. GitHub Copilot을 설치하고 copilot-instructions.md를 작성할 수 있다
4. 블로그 소개 페이지를 생성·검증·배포할 수 있다

**오늘의 산출물**:

| # | 파일 | 설명 |
| --- | --- | --- |
| 1 | `.github/copilot-instructions.md` | 프로젝트 규칙 (AI가 매 세션 자동 참조) |
| 2 | `app/page.tsx` | 블로그 소개 페이지 |
| 3 | 배포 URL | Vercel 자동 배포 결과 |

---

## 2.1 바이브코딩

**바이브코딩**(Vibe Coding)은 AI에게 "무엇을 만들고 싶은지" 설명하면 AI가 코드를 생성하고, 개발자가 검증·수정하는 방식이다.

```
① 설명 → ② 생성 → ③ 검증 → ④ 반복
```

가장 중요한 단계는 **③ 검증**이다. AI가 만든 코드를 그대로 사용하면 안 된다.

> AI 출력을 판단하려면 기본기가 필요하다. HTML 구조를 모르면 잘못된 마크업을 놓치고, JavaScript를 모르면 에러 메시지를 읽을 수 없다. 3~6장에서 기본기를 배우는 이유이다.
> 

---

## 2.2 AI 코딩의 3대 한계

### 한계 1: 버전 불일치

AI는 과거 데이터로 학습한다. `npx create-next-app@latest`로 최신 버전이 설치되지만, AI는 구버전 문법을 제안한다.

```tsx
// ❌ AI가 자주 제안하는 구버전 코드
import { useRouter } from "next/router";

// ✅ App Router에서 올바른 코드
import { useRouter } from "next/navigation";
```

**해결**: 설치 직후 버전을 확인하고 copilot-instructions.md에 기록한다.

### 한계 2: 컨텍스트 소실

AI에게는 장기 기억이 없다. 세션이 끝나면 이전 대화를 잊고, 열린 파일만 참고하며, 프로젝트 설계 의도를 모른다.

**해결**: `@workspace` 명령으로 프로젝트 전체를 참조시킨다.

### 한계 3: 환각

AI가 존재하지 않는 패키지, API, 옵션을 자신 있게 제시하는 현상이다.

| 유형 | 예시 |
| --- | --- |
| 가짜 패키지 | `npm install next-auth-supabase` — 존재하지 않음 |
| 가짜 API | `supabase.from('posts').upsertMany([...])` — 없는 메서드 |
| 가짜 옵션 | `fetch(url, { retry: 3 })` — fetch에 retry 옵션 없음 |

**해결**: 새 패키지는 [npmjs.com](https://npmjs.com/)에서 확인 후 설치한다.

### 3대 한계의 관계

```
버전 불일치 + 컨텍스트 부족 → 환각 확률 증가
```

---

## 2.3 Copilot 설정

### Copilot Pro 무료 활성화

1. [github.com/settings/copilot](https://github.com/settings/copilot) 접속
2. **"Get access to GitHub Copilot"** 클릭하여 활성화

> **주의**: 신용카드 입력이 요구되면 진행하지 않는다. 학생 혜택은 완전 무료이다.
> 

**트러블슈팅**: 승인 후 혜택이 안 보이면 72시간 대기 후 재로그인. 인증 실패 시 학생증 수동 업로드 또는 [GitHub Support](https://support.github.com/contact/education)에 티켓 제출.

### VS Code 확장 설치

| 확장명 | 용도 |
| --- | --- |
| GitHub Copilot | 코드 자동완성 (Tab 수락) |
| GitHub Copilot Chat | 대화형 코드 생성 (채팅 패널) |

설치 후 VS Code 오른쪽 하단에 Copilot 아이콘이 나타나면 성공이다.

### 자동완성 단축키

| 단축키 | 기능 |
| --- | --- |
| `Tab` | 제안 수락 |
| `Esc` | 제안 거부 |
| `Option + ]` / `[` | 다음/이전 제안 |

### Copilot Chat 주요 명령어

| 명령어 | 용도 |
| --- | --- |
| `@workspace` | 프로젝트 전체를 참조하여 대답 |
| `/explain` | 선택한 코드 설명 |
| `/fix` | 에러 수정 제안 |
| `Cmd + I` | 인라인 편집 |

### Copilot Chat 모드

| 모드 | 동작 | 예시 |
| --- | --- | --- |
| **Ask** | 질문에 답변 (코드 수정 안 함) | "이 함수가 뭘 하는 거야?" |
| **Edit** | 선택한 코드만 수정 | 코드 선택 → "TypeScript로 변환해줘" |
| **Agent** | 파일 탐색 + 수정 + 터미널 실행 | "게시글 CRUD API를 만들어줘" |

> 이 수업에서는 주로 **Agent 모드**를 사용한다.
> 

---

## 2.4 컨텍스트 관리와 [copilot-instructions.md](http://copilot-instructions.md/)

### 컨텍스트 관리 3계층

| 계층 | 도구 | 역할 | 필수 여부 |
| --- | --- | --- | --- |
| 1 | `copilot-instructions.md` | 프로젝트 규칙 (매 세션 자동 적용) | **필수** |
| 2 | `@workspace` | 프로젝트 전체 탐색 후 대답 | 권장 |
| 3 | MCP (Context7 등) | 최신 공식 문서 실시간 참조 | 선택 (부록 C) |

### copilot-instructions.md란

`.github/copilot-instructions.md`는 Copilot이 **매 세션마다 자동으로 읽는** 프로젝트 지시 파일이다. 컨텍스트 문제의 80%를 해결한다.

**포함할 내용**:

| 섹션 | 역할 |
| --- | --- |
| **Tech Stack** | 설치된 버전을 명시하여 맞는 문법 유도 |
| **Coding Conventions** | CSS 파일 생성 금지, 불필요한 `"use client"` 방지 등 |
| **Known AI Mistakes** | AI가 자주 틀리는 패턴을 미리 금지 |

**Known AI Mistakes 주요 항목**:

| 금지 | 사용 | 이유 |
| --- | --- | --- |
| `next/router` | `next/navigation` | App Router와 Pages Router의 경로가 다름 |
| `pages/` 폴더 | `app/` 폴더 | Pages Router는 구버전 |
| `@supabase/auth-helpers` | `@supabase/ssr` | 인증 라이브러리 교체됨 (Ch8) |
| `const { id } = params` | `const { id } = await params` | Next.js 15부터 params가 Promise (Ch5) |

### 점진적 보완 워크플로우

copilot-instructions.md는 한 번 만들고 끝이 아니다. **AI가 실수할 때마다 Known AI Mistakes에 추가**하여 같은 실수를 반복하지 않게 한다.

```
AI 실수 발견 → Known AI Mistakes에 패턴 추가 → 다음 세션부터 자동 적용
```

예시 — Ch3에서 AI가 `class="..."`를 생성했다면:

> ".github/copilot-instructions.md의 Known AI Mistakes에 추가해줘: `class` 금지 → `className` 사용"
> 

규칙이 축적될수록 AI의 정확도가 올라간다. 이것이 이 수업의 핵심 루틴이다.

### 🤖 실습: [copilot-instructions.md](http://copilot-instructions.md/) 만들기

Copilot Chat을 **Agent 모드**로 전환하고 다음 프롬프트를 입력한다:

> ".github/copilot-instructions.md 파일을 만들어줘.
> 
> 
> 내용:
> 
> - Tech Stack: package.json에서 확인한 Next.js, Tailwind CSS 버전 명시 (App Router ONLY)
> - Coding Conventions: Server Component 기본, Tailwind CSS만 사용
> - Known AI Mistakes: next/router 금지(next/navigation 사용), Pages Router 금지, params는 await 필수"

**검증**:

1. 생성된 파일을 열어 `package.json`의 실제 버전과 일치하는지 확인한다.
2. 틀리면 Copilot에게 수정 지시 후 저장한다.

---

## 2.5 좋은 프롬프트 작성법

**핵심 원칙**: ① 기술 스택 + ② 파일 위치 + ③ 구체적 요구사항

❌ 나쁜 프롬프트:

> "블로그 소개 페이지 만들어줘"
> 

→ 기술 스택, 파일 위치가 없다. AI가 임의로 판단한다.

✅ 좋은 프롬프트:

> "app/page.tsx를 블로그 소개 페이지로 수정해줘.
Tailwind CSS로 중앙에 흰색 카드(rounded-lg shadow)를 배치하고,
이름(text-3xl font-bold), 학교, 전공, 취미를 표시해줘."
> 

→ 파일 위치, 기술 스택, 구체적 요구사항이 명확하다.

### 🤖 실습: 블로그 소개 페이지 만들기

Copilot Chat(Agent 모드)에서 다음 프롬프트를 실행한다:

> "app/page.tsx를 블로그 소개 페이지로 수정해줘.
Tailwind CSS로 중앙에 흰색 카드(rounded-lg shadow)를 배치하고,
이름(text-3xl font-bold), 학교, 전공, 취미를 표시해줘."
> 

**검증** — AI가 생성한 코드에서 반드시 확인:

| 확인 항목 | ✅ 올바른 | ❌ 틀린 |
| --- | --- | --- |
| JSX 문법 | `className="..."` | `class="..."` |
| import 경로 | `from 'next/navigation'` | `from 'next/router'` |
| "use client" | Server Component는 제거 | 모든 파일에 자동 추가 |
1. 본인 정보로 수정한다.
2. `npm run dev` → [localhost:3000](http://localhost:3000/)에서 확인한다.

> AI가 틀린 부분을 발견하면, copilot-instructions.md의 Known AI Mistakes에 추가한다:
".github/copilot-instructions.md의 Known AI Mistakes에 추가해줘: '...'"
> 

---

## 2.6 Agent Skills (참고)

copilot-instructions.md가 "모든 상황의 일반 규칙"이라면, **Agent Skills**는 특정 키워드 포함 시 자동 발동되는 전문 규칙이다.

| 항목 | [copilot-instructions.md](http://copilot-instructions.md/) | Agent Skills |
| --- | --- | --- |
| 위치 | `.github/copilot-instructions.md` | `.github/skills/스킬명/SKILL.md` |
| 적용 시점 | 항상 | 관련 키워드 포함 시 자동 |

Skills는 Ch7(디자인 규칙)과 Ch12(에러 처리)에서 실전 예시를 다룬다.

---

## 🤖 배포

Copilot Chat(Agent 모드):

> "터미널에서 git add, commit, push를 실행해줘. 커밋 메시지: 'Ch2: 블로그 소개 페이지'"
> 

Vercel 대시보드에서 배포 완료 확인 후, 배포 URL에서 페이지가 정상 동작하는지 확인한다.

---

## AI 도구별 참조표

| 항목 | GitHub Copilot | Antigravity | Claude Code |
| --- | --- | --- | --- |
| 파일 참조 | `#file:app/page.tsx` | `@file` 또는 자동 인식 | `@파일명` 또는 자동 인식 |
| 터미널 실행 | Agent 모드에서 자동 | Agent Panel에서 자동 | 자동 실행 |
| 프로젝트 규칙 | `.github/copilot-instructions.md` | `AGENTS.md` | `CLAUDE.md` |
| 버전 명시 | copilot-instructions.md에 기록 | AGENTS.md에 기록 | CLAUDE.md에 기록 |
| MCP | `.vscode/mcp.json` 설정 | MCP 내장 (`@멘션`) | `.mcp.json` 또는 내장 |
| Agent 모드 | Chat 상단에서 Agent 선택 | Agent Panel (`Cmd+Shift+I`) 기본 | 기본 동작 |

> **Antigravity 사용자**: Copilot 승인 대기 중이라면 [antigravity.google](https://antigravity.google/)에서 다운로드. VS Code 포크 IDE로, `.edu` 이메일이면 Starter 플랜 무료. 자동완성, Agent Panel, MCP 기본 내장.
> 

---

## 제출 안내 (Google Classroom)