# Chapter 8. Supabase 시작하기 — A회차: 강의

> **미션**: 내 블로그(`my-first-web`)의 더미 데이터를 Supabase 실제 데이터베이스로 교체한다
> 

---

## 이 장의 흐름

이번 장은 **Supabase CLI + Vercel CLI로 자동화**한다. 직접 손이 필요한 3가지(가입·DB 비밀번호·Access Token)만 수동.

```mermaid
flowchart TD
    A["① 가입 + 첫 프로젝트<br/><small>대시보드 (수동)</small>"]
    B["② Access Token 발급<br/><small>대시보드 (수동)</small>"]
    C["③ CLI 로그인 + 프로젝트 링크<br/><small>npx supabase login / link</small>"]
    D["④ API 키 → .env.local<br/><small>npx supabase projects api-keys</small>"]
    E["⑤ 스키마 마이그레이션<br/><small>migration new + db push</small>"]
    F["⑥ Next.js 클라이언트<br/><small>Copilot 프롬프트 1개</small>"]
    G["⑦ Vercel 환경변수 + 배포<br/><small>대시보드 .env 일괄등록 + git push</small>"]

    A --> B --> C --> D --> E --> F --> G
```

| 단계 | 작업 | 도구 | 절 |
| --- | --- | --- | --- |
| ① | 가입 + 첫 프로젝트 | 대시보드 (수동) | 8.2 |
| ② | Access Token 발급 | 대시보드 (수동) | 8.3.1 |
| ③ | CLI 로그인 + 링크 | Supabase CLI | 8.3.2 |
| ④ | API 키 → .env.local | Supabase CLI | 8.3.3 |
| ⑤ | 스키마 마이그레이션 | Supabase CLI | 8.4 |
| ⑥ | Next.js 클라이언트 | Copilot | 8.5 |
| ⑦ | Vercel 환경변수 + 배포 | 대시보드 (.env 일괄) + git | 8.6 |

**고정 버전** (이 교재 기준):

| 패키지 | 버전 |
| --- | --- |
| `next` | 16.2.1 |
| `@supabase/supabase-js` | 2.47.12 |
| `@supabase/ssr` | 0.5.2 |

---

## 학습목표

1. BaaS 개념을 한 줄로 설명할 수 있다
2. Supabase CLI로 프로젝트를 만들고 API 키를 가져올 수 있다
3. 스키마를 마이그레이션 파일로 관리할 수 있다
4. Next.js에서 Supabase 클라이언트를 초기화할 수 있다

---

## 8.1 왜 Supabase?

Ch6까지 만든 블로그는 `lib/posts.ts`의 더미 데이터다. 새 글을 추가할 수 없다. 이 장에서 더미 데이터를 **Supabase 실제 데이터베이스**로 교체한다. 화면·컴포넌트는 그대로, **데이터 소스만 바뀐다**.

**BaaS(Backend as a Service)** — DB·인증·API를 직접 만들지 않고 서비스로 빌려 쓴다. Supabase는 PostgreSQL 기반 오픈소스이고 무료 플랜에서 2개 프로젝트까지 쓸 수 있다.

| 기능 | 직접 만들면 | Supabase |
| --- | --- | --- |
| 데이터베이스 | PostgreSQL 설치·설계 | 대시보드/CLI 한 줄 |
| 인증 | OAuth 직접 구현 | `signInWithPassword()` 한 줄 |
| API | REST 엔드포인트 설계 | 테이블 생성 시 자동 |
| 보안 | 미들웨어 직접 구현 | RLS로 DB 레벨 강제 |

---

## 8.2 첫 프로젝트 만들기 `🖱️ 수동 (1회)`

가입과 첫 프로젝트는 브라우저에서만 가능하다. 한 번 만들면 이후는 모두 CLI로 진행한다.

① **가입**: [https://supabase.com](https://supabase.com/) → **GitHub로 가입** (별도 이메일 가입 불필요)

② **New Project** 클릭 후 4가지 입력:

| 항목 | 입력 값 |
| --- | --- |
| Project name | `my-first-web` (영문 소문자, 하이픈) |
| Database Password | 강한 비밀번호 — **메모 필수, 변경 불가** |
| Region | Northeast Asia (Seoul) |
| 나머지는 그대로 유지 |  |

③ 생성에 1~2분 걸린다. 완료되면 대시보드로 진입.

> **DB Password를 까먹으면 프로젝트를 새로 만들어야 한다**. 비밀번호 관리자에 저장하라.
> 

---

## 8.3 Supabase CLI로 연결 `⌨️ CLI`

이 절부터는 모두 터미널이다. 명령을 그대로 복사해 붙여 넣어도 된다.

### 8.3.1 Access Token 발급 `🖱️ 수동 (1회)`

CLI가 Supabase 계정에 접근하려면 **Access Token**이 필요하다.

① https://supabase.com/dashboard/account/tokens 접속

② **Generate new token** 클릭 → 이름 입력(예: `my-first-web-cli`) → expires in "never" 선택 후 생성

③ Successfully generated a new token! 아래에 **`sbp_...` 형태의 토큰을 복사**한다 (생성 시 한 번만 표시됨, 이후 다시 못 봄)

### 8.3.2 CLI 로그인 + 프로젝트 링크 `⌨️ CLI`

**권장: VS Code 통합 터미널**

- `Terminal → New Terminal`
- `cd` 불필요. 바로 `npx supabase login`

```bash
# 1) CLI 로그인 — 브라우저 창이 열린다. 위에서 받은 토큰을 붙여 넣는다
npx supabase login

# 로그인 후 y 입력 -> 설치 후 enter -> 브라우저가 열리고 숫자가 나타나면 복사해서 터미널에 입력한다(Enter your verification code:)

# 2) REFERENCE ID 확인
npx supabase orgs list

  LINKED | ORG ID               | REFERENCE ID         | NAME         | REGION                     |
  --------|----------------------|----------------------|--------------|----------------------------|
          | gcpmwtntqeuciossgkzm | citgmhsbetcguolnotlt | my-first-web  | Northeast Asia (Seoul) |

REFERENCE ID) citgmhsbetcguolnotlt

# 4) 로컬 폴더를 프로젝트와 연결
npx supabase link --project-ref 프로젝트참조ID

예시: npx supabase link --project-ref citgmhsbetcguolnotlt
```

### 8.3.3 API 키 → .env.local `⌨️ CLI`

```bash
# Supabase가 만들어 둔 API URL과 anon key를 한 번에 조회
npx supabase projects api-keys --project-ref "프로젝트참조ID"
```

예시: npx supabase projects api-keys --project-ref citgmhsbetcguolnotlt

출력의 **anon** 키를 복사해 프로젝트 루트에 `.env.local`을 만든다:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트참조ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

예시:
NEXT_PUBLIC_SUPABASE_URL=https://funrzrhyvotqkyhtoblv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bnJ6cmh5dm90cWt5aHRvYmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTI5MjQsImV4cCI6MjA5MzM2ODkyNH0.Tp2NdoXpOEClEGD6l0pHHxd_7ghNH29xsvcux1GztS8

> **anon 키는 공개해도 안전한가?** 그렇다. 진짜 보안은 RLS(Ch11). anon 키는 "집 주소", RLS는 "잠금 장치".
> 
> 
> **`service_role` 키는 절대 클라이언트(브라우저 코드)에 두지 않는다**. 노출되면 RLS를 우회한다.
> 

---

## 8.4 스키마를 마이그레이션으로 `⌨️ CLI`

```bash
# 1) 마이그레이션 폴더 초기화 (최초 1회)
npx supabase init

# 2) 마이그레이션 파일 생성
npx supabase migration new create_tables
```

생성된 `supabase/migrations/<timestamp>_create_tables.sql`을 열어 위의 SQL을 붙여 넣고 저장한다.

예시: supabase/migrations/20260503155643_create_tables.sql
터미널에 위의 주소가 생기면 ctrl + 클릭 하면 ~~.sql 탭이 생긴다.
이 탭에 아래를 복사해서 넣는다.

```sql
-- profiles: auth.users 확장 (닉네임·역할 등 추가 정보)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'counselor')),
  created_at timestamptz default now()
);

-- posts: 블로그 글
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  created_at timestamptz default now()
);
```

```bash

# 3) 리모트(Supabase 프로젝트)에 적용
npx supabase db push
```

터미널에서 y 입력

성공하면 Supabase 대시보드 → Table Editor에서 `profiles`, `posts` 두 테이블이 보인다.

---

## 8.5 Next.js 연결 `🤖 바이브코딩`

이 절은 Copilot에게 한 번에 시킨다.

### 8.5.1 패키지 설치

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Copilot 프롬프트: 아래를 복사해서 요청한다.

> [버전 고정] Next.js 16.2.1, @supabase/ssr 0.5.2.
> 
> 
> [규칙] App Router만. 구버전 `createClient` from `@supabase/supabase-js` 직접 사용 금지.
> 
> "Next.js App Router용 Supabase 브라우저 클라이언트 파일을 만들어줘.
> 
> 경로: `lib/supabase/client.ts`. `@supabase/ssr`의 `createBrowserClient` 사용.
> 
> 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`."
> 

### 8.5.3 검증: 터미널에서 아래 명령 실행

```bash
# 빌드 통과 확인 (타입·환경변수 누락을 잡아준다)
npm run build
```

에러가 발생하지 않으면 성공한것임

---

## 8.6 Vercel 배포 `⌨️ Vercel CLI + git push`

환경변수 등록을 Vercel CLI로 처리한다. 첫 setup만 1회 실행하고, 이후는 `git push` 한 번이면 자동 배포.

### 8.6.1 Vercel CLI 설치 + 프로젝트 연결 (1회)

# (참고) vercel 에 프로젝트 배포하기

vercel 가입 후

1. 대시보드에서 "Add new project" > Import Git Repository에서 my-first-web 검색 후 import 클릭
2. Deploy 클릭

```bash
# 전역 설치
npm install -g vercel

# 로그인 — 브라우저 인증
vercel login

생성된 브라우저에서 allow 클릭

터미널에서 y 입력 엔터

# 로컬 폴더를 Vercel 프로젝트(Ch1에서 만든 my-first-web)와 연결
vercel link
```

이 경우는 가능한 타이핑하시기를....그리고 아래의 항목에 답한다.

`vercel link` 실행 중 묻는 항목:

- `Set up ...?` → `y`
- `Found project?` → `y`
- `Would you like to pull environment variables now?` → 'y'
- 'Found existing file ".env.local". Do you want to overwrite? ' -> 'n' : 조심하라.

### 8.6.2 환경변수 등록 — Vercel 대시보드에서 .env 일괄 등록

① [https://vercel.com](https://vercel.com/) → my-first-web 프로젝트 우상단의 "..."클릭 → **Settings → Environment -> production -> Environments variables -> Add environment variables ** 선택

② 하단의 import .env 클릭 -> save
윈도우즈 탐색기, 맥 finer 는 숨김파일에서 보이지 않는다. 윈도우즈는 전에 숨김파일 해재하는 방법 알려줬고 맥은 shift+command+.(점)을 클릭하면 보인다.

```
팝업창으로 deployment 뜨면 무시한다.

④ **Preview, Development ** 도 동일하게 등록한다.

⑤ **Save** 클릭.

### 8.6.3 배포

```bash
vscode source control에서 커밋 푸시
```

`git push`가 Vercel의 자동 배포를 트리거한다. 환경변수가 적용된 새 배포가 만들어진다.

```bash
# 배포 상태와 로그 확인 (선택)
vercel ls            # production : 최신 배포가 Ready 상태인지 확인
vercel logs          # 에러 로그
```

> **흔한 실수**: 환경변수만 등록하고 재배포를 안 하면 적용되지 않는다. `git push` 또는 `vercel --prod`로 새 배포를 만들어야 한다.
> 
> 
> "로컬에서는 되는데 배포하면 안 돼요"의 90%는 환경변수 누락이거나 재배포 누락이다.
> 

---

## 흔한 AI 실수

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| `createClient` from `@supabase/supabase-js` 직접 사용 | 쿠키 세션 작동 안 함 | `@supabase/ssr`의 `createBrowserClient` |
| `NEXT_PUBLIC_` 접두사 누락 | 브라우저에서 `undefined` | `.env.local` 키 이름 확인 |
| `.env` 파일 사용 | Git에 키 노출 위험 | `.env.local`로 이동 |
| `service_role` 키 브라우저 사용 | RLS 우회 가능 | 브라우저에는 `anon`만 |
| `users` 테이블 직접 생성 | Supabase Auth와 연동 불가 | `profiles` → `auth.users(id)` 참조 |

---

## 핵심 정리 + B회차 과제 스펙

### 이번 시간 핵심 3가지

1. **BaaS** — DB·인증·API를 서비스로 빌려 쓴다 (Supabase = PostgreSQL 기반 오픈소스)
2. **CLI 자동화** — 가입·DB Password·Access Token·Vercel 환경변수만 수동, 나머지는 `supabase` 명령
3. **마이그레이션** — 스키마 변경은 SQL 파일로 Git에 남긴다 (다른 환경에서 재현 가능)

### B회차 과제 스펙

1. Supabase 가입 + 첫 프로젝트 생성
2. Access Token 발급 + `npx supabase login`
3. `supabase link` + `projects api-keys` → `.env.local` 작성
4. `migration new` + SQL 붙여넣기 + `db push`
5. `lib/supabase/client.ts` 작성 (Copilot)
6. Vercel 환경변수 등록 + `git push`로 배포

### 컨텍스트 업데이트 (간단)

새 세션을 시작할 때 Copilot에게 한 줄:

```
#file:context.md #file:ARCHITECTURE.md

Ch8 Supabase 작업 중. 진행: (예: 마이그레이션까지 완료, Next.js 연결 차례)
@supabase/ssr의 createBrowserClient 패턴으로 작업해줘.
```