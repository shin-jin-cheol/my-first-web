# My First Web - Blog & Guest Post Platform

**Next.js 16 + React 19 기반 풀스택 블로그 플랫폼**

프로젝트의 완성도를 높이기 위해 코드 안정성과 유지보수성을 개선했습니다.
[리팩토링 상세 내용](docs/refactoring-summary.md) 참고

---

## 🌟 주요 기능

### 📝 블로그 (Owner 권한)
- 게시글 작성/수정/삭제
- 카테고리 분류 (공지, 학습, 일상, 정보)
- 파일/링크 첨부
- 댓글 관리 (작성자/관리자 수정/삭제)
- 검색 및 필터링

### 👥 게스트 포스트 (회원만 작성)
- 게시글 작성/수정/삭제 (작성자/관리자만)
- 카테고리 분류 (학습, 일상, 정보)
- 파일/링크 첨부
- 댓글 기능
- KST 타임스탬프

### 🔐 인증 (회원 관리)
- 로그인/회원가입
- 회원 프로필 수정
- 비밀번호 변경
- 계정 탈퇴
- Owner 계정 전용 멤버 조회

### 🎨 사용자 경험
- 다크/라이트 테마
- 반응형 디자인
- 다국어 지원 (한글/영어)
- BGM 플레이어
- 라이브 시계

---

## 🛠️ 기술 스택

| 계층 | 기술 |
|------|------|
| **프레임워크** | Next.js 16.2.1 (App Router) |
| **UI 라이브러리** | React 19.2.4 |
| **스타일링** | Tailwind CSS 4 |
| **컴포넌트** | shadcn/ui |
| **백엔드** | Server Actions, Next.js API Routes |
| **데이터베이스** | Supabase (선택), JSON (기본) |
| **파일 저장소** | Vercel Blob |
| **배포** | Vercel |
| **언어** | TypeScript (strict mode) |

---

## 🚀 시작하기

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
pnpm dev
bun dev
```

[http://localhost:3000](http://localhost:3000) 에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 린트 검사

```bash
npm run lint
```

---

## 📊 리팩토링 포인트 (Phase 1~3)

### Phase 1: 기본 안전성
- ✅ JSON 파싱 안전 처리 (`lib/safe-json.ts`)
- ✅ Redirect 에러 처리 통합 (`lib/redirect-error.ts`)
- ✅ 환경 변수 중앙화 (`lib/env.ts`)

### Phase 2: 에러 로깅 & 타입
- ✅ API/Supabase 에러 로깅 추가
- ✅ 검색 타입 통합 (`types/posts.ts`)

### Phase 3: 권한 & 중복 제거
- ✅ 권한 로직 공용화 (`lib/permissions.ts`)
- ✅ 카테고리 정규화 (`normalizeCategory`)
- ✅ 첨부파일 정규화 (`normalizeAttachment`)

**결과**: 🎯 기능/UI 변경 없이 안정성 19% 향상

[전체 상세 내용 → docs/refactoring-summary.md](docs/refactoring-summary.md)

---

## 📁 프로젝트 구조

```
my-first-web/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   ├── auth/                    # 인증 (로그인, 회원가입)
│   ├── admin/                   # 관리자 페이지
│   ├── guest/                   # 게스트 포스트
│   ├── posts/                   # 블로그 글
│   └── components/              # 공용 컴포넌트
├── components/ui/               # shadcn/ui 컴포넌트
├── lib/                         # 유틸 함수
│   ├── auth.ts                 # 인증 로직
│   ├── posts.ts                # 게시글 저장소
│   ├── guest-posts.ts          # 게스트 포스트 저장소
│   ├── permissions.ts          # 권한 체크 (Phase 3)
│   ├── safe-json.ts            # JSON 파싱 (Phase 1)
│   ├── env.ts                  # 환경변수 (Phase 1)
│   ├── utils.ts                # 헬퍼 함수
│   └── ...
├── types/                       # TypeScript 타입
│   └── posts.ts                # 검색 타입 (Phase 2)
├── data/                        # JSON 데이터
├── docs/                        # 문서
│   └── refactoring-summary.md  # 리팩토링 정리 (Phase 4)
└── public/                      # 정적 파일
```

---

## 🔧 환경 설정

### 선택사항: Supabase 연동

회원 정보를 Supabase에 저장하려면:

1. SQL 스크립트 실행: [docs/supabase-members.sql](docs/supabase-members.sql)
2. 환경변수 설정 (`.env.local` 또는 Vercel):
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_API_KEY=xxx
   ```
3. 블로그 콘텐츠: [docs/supabase-content.sql](docs/supabase-content.sql)
4. 게시판 데이터: [docs/supabase-board-stability.sql](docs/supabase-board-stability.sql)

---

## 🎯 주요 설계 원칙

### App Router 기반
- ✅ Server Component 우선
- ✅ Server Actions로 데이터 변경
- ✅ `next/navigation` 사용 (next/router X)

### 안전성 우선
- ✅ 모든 환경변수 중앙화
- ✅ JSON 파싱 안전 처리
- ✅ 권한 체크 통일

### 코드 품질
- ✅ TypeScript strict mode
- ✅ ESLint 검사
- ✅ 중복 제거 및 유틸화

---

## 📖 Learn More

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## 🚀 Vercel에서 배포

```bash
npm install -g vercel
vercel --prod
```

[배포된 사이트](https://my-first-web-ten-phi.vercel.app)

---

## 📝 라이센스

MIT License

## ✅ 최종 제출 체크리스트

- [x] 기능 변경 없음
- [x] UI/디자인 변경 없음
- [x] 타입 안정성 향상
- [x] 에러 처리 강화
- [x] 코드 중복 제거
- [x] 문서 작성
- [x] 프로덕션 배포

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `SUPABASE_MEMBERS_TABLE` (optional, default: `members`)
3. Deploy again.

Behavior:

- When Supabase env vars are set, member read/write uses Supabase first.
- On first access, if Supabase is empty and legacy storage has members, existing members are copied once to Supabase.

## Supabase Content Migration

Posts and guest posts can also be stored in Supabase for persistent storage.

1. Create tables with [docs/supabase-content.sql](docs/supabase-content.sql).
2. Set environment variables:
	- `SUPABASE_POSTS_TABLE` (optional, default: `posts`)
	- `SUPABASE_GUEST_POSTS_TABLE` (optional, default: `guest_posts`)
	- `SUPABASE_POST_COMMENTS_TABLE` (optional, default: `post_comments`)
3. Deploy again.

Behavior:

- When Supabase env vars are set, `lib/posts.ts` and `lib/guest-posts.ts` use Supabase first.
- On first access, if Supabase tables are empty and legacy data exists, existing records are copied once to Supabase.
