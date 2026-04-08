# B회차: 실습

> **미션**: 블로그 프론트엔드를 완성하고 배포한다 — 검색, 폼, 삭제, 데이터 페칭
> 

---

---

## 과제 스펙 + 스타터 코드 안내

### 과제 요구사항

Ch5에서 만든 블로그에 **인터랙션**을 추가하여 프론트엔드를 완성한다:

① 게시글 검색 — SearchBar를 Client Component로 분리, useState + filter로 제목 검색

② 게시글 작성 폼 — 제어 컴포넌트 패턴, 빈 제목 입력 시 경고

③ 게시글 삭제 — confirm 후 filter로 제거 (불변성 유지)

④ 데이터 페칭 — JSONPlaceholder API에서 게시글 가져오기 (서버 또는 클라이언트)

⑤ Server/Client 분리 — 인터랙션이 필요한 부분만 "use client"

### 이번 챕터에서 추가/수정할 파일

Ch5에서 만든 블로그 프로젝트를 이어서 사용한다.

- `components/SearchBar.js` — 새로 생성 (`"use client"` + useState로 검색 기능)

- `app/page.js` — 수정 (SearchBar 통합 + 게시글 필터링)

- `app/posts/new/page.js` — 수정 (제어 컴포넌트 패턴 + 유효성 검증)

- 게시글 삭제 기능 추가 (목록 또는 상세 페이지에 삭제 버튼)

---

## 바이브코딩 가이드

> **Copilot 활용**: 이번 실습에서는 Copilot Chat에 프롬프트를 입력하여 상태 관리와 이벤트 처리를 구현한다. 생성된 코드를 그대로 쓰지 말고, A회차에서 배운 기준으로 반드시 검증한다.
> 

### 이번 실습에서 활용할 MCP · Skills

| 도구 | 활용 방법 |
| --- | --- |
| **nextjs-basic-check** | Server Component와 Client Component를 올바르게 분리했는지 점검한다. |

- Context7 프롬프트 예시: `use context7. Next.js App Router에서 Server Component와 Client Component를 어떻게 구분하는지 알려줘`

- Skills 점검 프롬프트 예시: `nextjs-basic-check 기준으로 "use client" 누락이나 Server/Client 구분 오류를 찾아줘`

**좋은 프롬프트 vs 나쁜 프롬프트**:

❌ 나쁜 프롬프트:

> "블로그에 검색 기능 추가해줘"
> 

문제: Server/Client 구분, 상태 관리 방식, 컴포넌트 분리 전략이 전혀 명시되지 않았다.

✅ 좋은 프롬프트:

> [ubc84uc804 uace0uc815] Next.js 14.2.21, React 18.3.1, Tailwind CSS 3.4.17, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2 uae30uc900uc73cub85c uc791uc131ud574uc918.
> 

> [uaddcuce59] App Routerub9cc uc0acuc6a9ud558uace0 next/router, pages router, uad6cubc84uc804 APIub294 uc0acuc6a9ud558uc9c0 ub9c8.
> 

> [uac80uc99d] ubd88ud655uc2e4ud558uba74 ud604uc7ac ud504ub85cuc81dud2b8 package.json uae30uc900uc73cub85c ubc84uc804uc744 uba3cuc800 ud655uc778ud558uace0 ub2f5ud574uc918.
> 

> "블ub85cuadf8 ubaa9ub85d ud398uc774uc9c0uc5d0 uac80uc0c9 uae30ub2a5uc744 ucd94uac00ud574uc918.
> 

> SearchBarub294 'use client' Client Componentub85c ubd84ub9ac (components/SearchBar.js).
> 

> useStateub85c uac80uc0c9uc5b4ub97c uad00ub9acud558uace0, posts ubc30uc5f4uc744 filterub85c uc81cubaa9 uac80uc0c9.
> 

> uac80uc0c9 uacb0uacfcuac00 uc5c6uc73cuba74 'uac80uc0c9 uacb0uacfcuac00 uc5c6uc2b5ub2c8ub2e4' ud45cuc2dc.
> 

> Next.js 14, Tailwind CSS, App Router uc0acuc6a9."
> 

---

## 개인 실습

### 체크포인트 1: 검색 기능

**목표**: SearchBar Client Component를 완성하여 게시글 제목 검색 기능을 구현한다.

① `components/SearchBar.js`에서 useState로 검색어 상태를 관리한다

② onChange 이벤트로 검색어를 실시간 업데이트한다

③ `app/page.js`(또는 `app/posts/page.js`)에서 SearchBar를 import하고, 검색어에 따라 게시글을 filter한다

④ 검색 결과가 0건이면 "검색 결과가 없습니다" 메시지를 표시한다

⑤ `"use client"`가 SearchBar에만 있는지 확인한다 (메인 페이지에는 없어야 함)

### 체크포인트 2: 게시글 작성 + 삭제 기능

**목표**: 게시글 작성 폼과 삭제 기능을 구현한다.

① `app/posts/new/page.js`에 제어 컴포넌트 패턴을 적용한다 (value + onChange)

② 제목이 비어있으면 경고 메시지를 표시한다 (form.title.trim() 검증)

③ 게시글 목록에 삭제 버튼을 추가한다

④ 삭제 시 `window.confirm()`으로 확인을 받는다

⑤ `posts.filter()`로 해당 게시글을 제거한다 (push/splice 사용 금지)

Copilot에게 삭제 기능을 요청할 때:

> [ubc84uc804 uace0uc815] Next.js 14.2.21, React 18.3.1, Tailwind CSS 3.4.17, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2 uae30uc900uc73cub85c uc791uc131ud574uc918.
> 

> [uaddcuce59] App Routerub9cc uc0acuc6a9ud558uace0 next/router, pages router, uad6cubc84uc804 APIub294 uc0acuc6a9ud558uc9c0 ub9c8.
> 

> [uac80uc99d] ubd88ud655uc2e4ud558uba74 ud604uc7ac ud504ub85cuc81dud2b8 package.json uae30uc900uc73cub85c ubc84uc804uc744 uba3cuc800 ud655uc778ud558uace0 ub2f5ud574uc918.
> 

> "uac8cuc2dcuae00 uce74ub4dcuc5d0 uc0aduc81c ubc84ud2bcuc744 ucd94uac00ud574uc918.
> 

> ud074ub9adud558uba74 window.confirmuc73cub85c ud655uc778 ud6c4 posts stateuc5d0uc11c filterub85c uc81cuac70.
> 

> ubd88ubcc0uc131 uc720uc9c0 u2014 push/splice uc0acuc6a9 uae08uc9c0, setPosts(posts.filter()) ud328ud134."
> 

### 체크포인트 3: 검증 + 배포

**목표**: AI 코드를 검증하고 배포한다.

① 아래 검증 체크리스트를 수행한다

② 문제가 있으면 수정한다

③ git add -> git commit -> git push 로 배포한다:

```bash
git add .
git commit -m "Ch6: 블로그 프론트엔드 완성 (검색, 폼, 삭제)"
git push
```

④ Vercel 대시보드에서 배포 완료를 확인한다

⑤ 배포된 URL을 브라우저에서 열어 동작을 확인한다

⑥ 검색, 작성, 삭제가 모두 동작하는지 확인한다

---

## 검증 체크리스트

**표 6.7** AI 생성 코드 검증 체크리스트

| 항목 | 확인 내용 | 확인 |
| --- | --- | --- |
| useState import | `import { useState } from "react"` 인가? | ☐ |
| 불변성 유지 | push/splice 대신 스프레드/filter/map 사용하는가? | ☐ |
| Server/Client 분리 | 인터랙션 없는 부분은 Server Component인가? | ☐ |
| 배포 URL 동작 | 검색, 작성, 삭제가 모두 동작하는가? | ☐ |

---

## 흔한 AI 실수

**표 6.8** Ch6에서 AI가 자주 틀리는 패턴

| AI 실수 | 올바른 방법 | 발생 원인 | 전체 페이지에 `"use client"` | 인터랙션 부분만 Client Component 분리 | Server/Client 구분 미인식 |
| --- | --- | --- | --- | --- | --- |
| `posts.push(newPost)` (직접 수정) | `setPosts([...posts, newPost])` | 불변성 원칙 미적용 | `useEffect` 의존성 배열 누락 | 사용하는 변수를 배열에 포함 | React 규칙 미준수 |
| `onClick={handleClick()}` (즉시 실행) | `onClick={handleClick}` (참조 전달) | 함수 호출과 참조 혼동 | Server Component에서 useState 사용 | `"use client"` 추가 필요 | 컴포넌트 유형 혼동 |
| fetch 에러 처리 없음 | try-catch 또는 .catch() 추가 | 에러 시나리오 무시 | useEffect 클린업 빠뜨림 | return () => cleanup() 추가 | 메모리 누수 가능 |

---

## 제출 안내 (Google Classroom)

Google Classroom의 "Ch6 과제"에 아래 두 항목을 제출한다:

```
① 배포 URL
   예: https://내프로젝트.vercel.app

② AI가 틀린 부분 1개
   예: "Copilot이 전체 page.js에 'use client'를 넣었는데,
       SearchBar만 Client Component로 분리했다."
```

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

- Server/Client 분리: 모범 구현은 `"use client"`를 어떤 컴포넌트에만 사용했는가?

- 상태 관리: `useState` + 불변성 패턴(스프레드/filter)이 동일한가?

- 데이터 흐름: 서버에서 fetch vs 클라이언트에서 useEffect, 모범 구현은 어떤 방식인가?

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

## TypeScript 변환 완료 (2026-03-23)

### 파일 참조 업데이트

- lib/supabase/client.js → lib/supabase/client.ts
- lib/supabase/server.js → lib/supabase/server.ts
- lib/auth.js → lib/auth.ts
- contexts/AuthContext.js → contexts/AuthContext.tsx
- middleware.js → middleware.ts
- 모든 page/component .js → .tsx

### 관련 파일

- docs/ch7A.md, ch8A.md, ch9A.md 에서 총 37개 파일명 참조 업데이트
- 코드 블록은 이미 typescript/tsx 태그 사용 중

### 다음 단계

다음 실습부터 생성되는 모든 파일은 TypeScript 확장자를 사용합니다.