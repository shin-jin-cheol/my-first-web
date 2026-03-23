# B회차: 실습

> **미션**: Copilot으로 블로그 소개 페이지를 만들고 배포한다
> 

---

---

## 과제 스펙 + 스타터 코드 안내

### 과제 요구사항

**Copilot 설정 + 블로그 소개 페이지**를 만든다:

① GitHub Copilot / Copilot Chat 확장 설치 완료

② `.github/copilot-instructions.md` 파일 작성 완료

③ Copilot Chat을 사용하여 블로그 소개 페이지 생성 (이름, 학교, 전공, 취미 등)

④ AI 코드 검증 체크리스트 수행

⑤ git push → Vercel 배포 + AI 사용 로그 작성

### 이번 챕터에서 추가/수정할 파일

Ch1에서 만든 블로그 프로젝트를 이어서 사용한다.

- `.github/copilot-instructions.md` — 새로 생성 (Copilot 지시사항)
- `app/page.js` — Copilot으로 블로그 소개 페이지 생성

---

## 바이브코딩 가이드

> **Copilot 활용**: 이번 실습에서는 Copilot Chat에 프롬프트를 입력하여 블로그 소개 페이지를 생성한다. 생성된 코드를 그대로 쓰지 말고, A회차에서 배운 검증 체크리스트로 반드시 확인한다.
> 

**좋은 프롬프트 vs 나쁜 프롬프트**:

❌ 나쁜 프롬프트:

> "블로그 소개 페이지 만들어줘"
> 

문제: 기술 스택, 파일 위치, 디자인 요구사항이 전혀 없다.

✅ 좋은 프롬프트:

> [버전 고정] Next.js 14.2.21, React 18.3.1, Tailwind CSS 3.4.17, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2 기준으로 작성해줘.
> 

> [규칙] App Router만 사용하고 next/router, pages router, 구버전 API는 사용하지 마.
> 

> [검증] 불확실하면 현재 프로젝트 package.json 기준으로 버전을 먼저 확인하고 답해줘.
> 

> "Next.js App Router의 app/page.js에 블로그 소개 페이지를 만들어줘.
> 

> Tailwind CSS를 사용하고, 배경은 밝은 회색(bg-gray-50).
> 

> 중앙에 흰색 카드(bg-white, rounded-lg, shadow) 배치.
> 

> 카드 안에 이름, 학교, 전공, 취미를 표시해줘.
> 

> 이름은 text-3xl font-bold, 나머지는 text-gray-600."
> 

---

## 개인 실습

### 체크포인트 1: Copilot 확인 + [copilot-instructions.md](http://copilot-instructions.md) 완성

**목표**: Copilot이 정상 동작하고, [copilot-instructions.md](http://copilot-instructions.md)를 완성한다.

① VS Code에서 Copilot 아이콘이 보이는지 확인한다 (오른쪽 하단)

② Copilot Chat 패널을 열고 "Hello"라고 입력하여 응답이 오는지 확인한다

③ `.github/copilot-instructions.md` 파일을 열고 TODO 항목을 채운다

④ Tech Stack, Coding Conventions, Known AI Mistakes 섹션을 완성한다

⑤ 파일을 저장한다

### 체크포인트 2: 블로그 소개 페이지 생성 + 검증

**목표**: Copilot으로 블로그 소개 페이지를 만들고 검증한다.

① Copilot Chat에 프롬프트를 입력하여 블로그 소개 코드를 생성한다

② 생성된 코드를 `app/page.js`에 붙여넣는다

③ **검증 체크리스트 수행**:

- import 경로가 올바른가?
- Tailwind 클래스가 올바른가? (className으로 되어 있는가?)
- "use client"가 불필요하게 들어있지 않은가?
- 환경변수가 하드코딩되어 있지 않은가?

④ 본인 정보로 내용을 수정한다

⑤ 추가 프롬프트로 기능을 추가해도 좋다 (사진, 링크 등)

> [버전 고정] Next.js 14.2.21, React 18.3.1, Tailwind CSS 3.4.17, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2 기준으로 작성해줘.
> 

> [규칙] App Router만 사용하고 next/router, pages router, 구버전 API는 사용하지 마.
> 

> [검증] 불확실하면 현재 프로젝트 package.json 기준으로 버전을 먼저 확인하고 답해줘.
> 

> "이 블로그 소개 페이지에 GitHub 링크와 이메일 링크를 추가해줘. 아이콘 대신 텍스트 링크로 하고, hover:text-blue-500 효과를 넣어줘."
> 

### 체크포인트 3: AI 사용 로그 + 배포

**목표**: AI 사용 로그를 작성하고 배포한다.

① AI 사용 로그를 작성한다:

```
[프롬프트] (어떤 프롬프트를 사용했는가)
[AI 실수]  (AI가 틀린 부분이 있었는가)
[분류]     (버전 불일치 / 컨텍스트 소실 / 환각 / 없음)
[해결]     (어떻게 수정했는가)
[조치]     (copilot-instructions.md에 추가한 내용)
```

② git add → git commit → git push로 배포한다:

```bash
git add .
git commit -m "Ch2: 블로그 소개 페이지 + copilot-instructions.md"
git push
```

③ Vercel 대시보드에서 배포 완료를 확인한다

④ 배포된 URL을 브라우저에서 열어 동작을 확인한다

---

## 검증 체크리스트

**표 2.14** AI 코드 검증 체크리스트

| 항목 | 확인 | Copilot/Copilot Chat 확장이 설치되었는가? | ☐ |
| --- | --- | --- | --- |
| `.github/copilot-instructions.md`가 작성되었는가? | ☐ | import 경로가 올바른가? | ☐ |
| `className`을 사용했는가? (`class` 아님) | ☐ | 불필요한 `"use client"`가 없는가? | ☐ |
| 환경변수가 하드코딩되어 있지 않은가? | ☐ | 배포 URL에서 정상 동작하는가? | ☐ |

---

## 흔한 AI 실수

**표 2.15** Ch2에서 AI가 자주 틀리는 패턴

| AI 실수 | 올바른 코드 | 발생 원인 |
| --- | --- | --- |
| 불필요한 `"use client"` 추가 | Server Component로 충분한 경우 제거 | 클라이언트 컴포넌트 남용 |
| 존재하지 않는 패키지 추천 | [npmjs.com](http://npmjs.com)에서 검증 후 설치 | 환각 |
| `getServerSideProps` 사용 | App Router 서버 컴포넌트 | Pages Router 문법 (구 버전) |

---

## 제출 안내 (Google Classroom)

Google Classroom의 "Ch2 과제"에 아래 항목을 제출한다:

```
① 배포 URL
   예: https://내프로젝트.vercel.app

② AI가 틀린 부분 1개
   예: "Copilot이 'use client'를 불필요하게 추가했는데,
       이 페이지는 서버 컴포넌트로 충분하므로 제거했다."
```

> AI가 틀린 부분이 딱히 없었다면, "Copilot이 생성한 코드에서 확인한 점"을 기술한다. 예: "className이 올바르게 사용되었고, import 경로도 맞았다."
> 

---

## 참고 구현

> 제출 마감 후 모범 구현을 확인한다. 자기 코드와 비교해 차이점을 찾고 수정한다.
> 

**진행 순서**:

| 시간 | 활동 |
| --- | --- |
| 7분 | 자기 코드와 참고 구현을 비교 — 다른 부분 3개 이상 찾기 |
| 3분 | 핵심 차이점 1~2개 정리 |

**비교 포인트**:

- [copilot-instructions.md](http://copilot-instructions.md): 모범 구현의 지시사항과 내가 작성한 것의 차이는?
- 프롬프트 전략: 같은 기능을 모범 구현은 어떤 프롬프트로 만들었는가?
- AI 사용 로그: 모범 구현의 검증 과정과 내 검증 과정을 비교

---

## TypeScript 변환 완료 (2026-03-23)

### 파일명 참조 일괄 업데이트

- 모든 .js 파일명을 .tsx (컴포넌트) 또는 .ts (유틸리티)로 변경
- 총 80개+ 파일 참조 변경
- package.json, 폴더 구조, 과제 안내 모두 업데이트

### 실습 안내

- Ch1B: 기본 컴포넌트 구조는 이미 .tsx
- Ch5B: 데이터 파일 예제에 Post 인터페이스 추가
- Ch8B-Ch13B: 모두 TypeScript 타입 적용 완료

### 과제 제출 시 확인사항

생성된 모든 파일이 .tsx/.ts 확장자인지 확인하세요.