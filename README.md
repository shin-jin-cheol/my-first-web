# my-first-web

## 1. 프로젝트 소개

`my-first-web`는 개인 블로그와 회원 기반 게스트 커뮤니티를 함께 제공하는 Next.js 애플리케이션입니다. 게시글과 댓글, 친구 관계, 1:1 실시간 채팅, 알림, 프로필, 파일/이미지 첨부 기능을 App Router와 Server Actions 중심으로 구성합니다.

## 2. 배포 URL

- https://my-first-web-ten-phi.vercel.app

## 3. 기술 스택

- Framework: Next.js 16.2.1, App Router
- UI: React 19.2.4, Tailwind CSS 4, CSS variables
- Components: shadcn/ui, Radix UI, lucide-react
- Language: TypeScript
- Backend: Supabase REST, Supabase Storage, Supabase Realtime
- Storage fallback: Vercel Blob, local JSON/file fallback
- Auth: 자체 세션 쿠키 + 이메일 OTP
- CI/E2E: Playwright, GitHub Actions
- Deploy: Vercel

## 4. 주요 기능 목록

### 게시글/댓글

- 블로그 게시글 작성, 조회, 수정, 삭제
- 게스트 게시글 작성, 조회, 수정, 삭제
- 카테고리, 검색, 정렬, 조회수 처리
- 댓글, 대댓글, 게시글/댓글 이모지 반응
- 링크, 파일, HTML 파일, 본문 이미지 첨부
- YouTube URL 입력 및 상세 화면 iframe 임베드
- 게시글/게스트 게시글 작성 중 `localStorage` 자동 저장
- 이미지 업로드 시 canvas API 기반 최대 1200px 리사이징

### 친구/프로필

- 공개 프로필 페이지(`/profile/[id]`)
- owner/member 프로필 아바타 표시 및 업로드
- 친구 검색, 친구 요청, 수락, 거절, 삭제
- 친구 목록 카드의 채팅/삭제 액션 우측 고정 정렬
- 친구 목록에서 1:1 채팅방 생성 및 진입

### 채팅

- 친구 간 1:1 실시간 채팅(`/chat/[roomId]`)
- Supabase Realtime 기반 메시지 INSERT/UPDATE 구독
- 채팅 이미지 전송 및 확대 보기
- 메시지 자동 스크롤, Enter 전송, 상대방 이름/아바타 표시
- 플로팅 채팅창과 전체 화면 채팅 전환
- 전역 `ChatContext`와 `GlobalChatWindow` 기반 채팅 상태 관리
- `messages.is_read` 기반 읽음 표시와 Realtime UPDATE 반영
- BGM 플레이어 최소화 상태와 채팅창 위치 연동

### UI/UX

- 반응형 모바일/데스크탑 레이아웃
- 모바일 nav 스크롤 방향별 숨김/표시
- 채팅 화면 모바일 최적화와 16px 이상 입력 폰트 유지
- BGM 플레이어와 최소화 탭
- 알림 아이콘, 안읽음 뱃지, 알림 드롭다운
- 스켈레톤 UI, 스크롤 애니메이션, 다국어 텍스트 처리
- 테마/언어 설정 UI
- 홈을 제외한 페이지 헤더 뒤로가기 버튼

### 보안/인증

- 자체 `sjc-session` 쿠키와 `SESSION_SECRET` 기반 세션 서명 검증
- 이메일 OTP 기반 회원가입/로그인 흐름
- Owner 비밀번호 SHA-256 해시 비교
- 보호 라우트는 Next.js 16 기준 `proxy.ts`에서 처리
- 게시글/댓글/게스트 게시글 권한은 Server Action과 `lib/permissions.ts`에서 검증
- `service_role` 키는 서버 경로에서만 사용하고 브라우저 번들에 노출하지 않음
- 환경변수는 `lib/env.ts`에서 중앙 관리

## 5. 프로젝트 구조

```text
my-first-web/
├─ app/                         # App Router 페이지, 레이아웃, Server Actions
│  ├─ auth/                      # 로그인, 회원가입
│  ├─ posts/                     # 블로그 게시글
│  ├─ guest/                     # 게스트 게시판
│  ├─ friends/                   # 친구 검색, 요청, 목록 관리
│  ├─ chat/                      # 1:1 채팅
│  ├─ profile/                   # 공개 프로필
│  ├─ admin/                     # Owner 관리 화면
│  └─ components/                # 앱 전용 UI 컴포넌트
├─ components/                   # 공통 컴포넌트
├─ components/ui/                # shadcn/ui 기반 컴포넌트
├─ lib/                          # 데이터, 인증, 권한, 저장소, 유틸
│  ├─ auth/                      # 자체 인증과 세션 처리
│  ├─ supabase/                  # Supabase HTTP/browser client
│  ├─ context/                   # Chat/Player 전역 상태
│  └─ env.ts                     # 환경변수 중앙 관리
├─ supabase/migrations/          # Supabase 스키마 마이그레이션
├─ data/                         # local fallback JSON 데이터
├─ docs/                         # 보조 문서와 SQL 참고 자료
├─ types/                        # 공통 타입
└─ .github/workflows/            # Playwright CI workflows
```

## 6. 환경변수 목록

`lib/env.ts`에서 중앙 관리합니다.

### Supabase

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Supabase 테이블/버킷 옵션

- `SUPABASE_MEMBERS_TABLE` (default: `members`)
- `SUPABASE_OWNER_SETTINGS_TABLE` (default: `owner_settings`)
- `SUPABASE_FRIENDS_TABLE` (default: `friends`)
- `SUPABASE_POSTS_TABLE` (default: `posts`)
- `SUPABASE_GUEST_POSTS_TABLE` (default: `guest_posts`)
- `SUPABASE_POST_COMMENTS_TABLE` (default: `post_comments`)
- `SUPABASE_GUEST_POST_COMMENTS_TABLE` (default: `guest_post_comments`)
- `SUPABASE_POST_REACTIONS_TABLE` (default: `post_reactions`)
- `SUPABASE_POST_COMMENT_REACTIONS_TABLE` (default: `post_comment_reactions`)
- `SUPABASE_GUEST_POST_REACTIONS_TABLE` (default: `guest_post_reactions`)
- `SUPABASE_GUEST_COMMENT_REACTIONS_TABLE` (default: `guest_comment_reactions`)
- `SUPABASE_CHAT_ROOMS_TABLE` (default: `chat_rooms`)
- `SUPABASE_MESSAGES_TABLE` (default: `messages`)
- `SUPABASE_NOTIFICATIONS_TABLE` (default: `notifications`)
- `SUPABASE_UPLOADS_BUCKET` (default: `uploads`)
- `SUPABASE_AVATARS_BUCKET` (default: `avatars`)
- `SUPABASE_CHAT_IMAGES_BUCKET` (default: `chat-images`)
- `SUPABASE_POST_IMAGES_BUCKET` (default: `post-images`)

### 인증/저장소/운영

- `SESSION_SECRET`
- `OWNER_ID`
- `OWNER_PASSWORD`
- `OWNER_NAME`
- `BLOB_READ_WRITE_TOKEN`
- `NODE_ENV`
- `VERCEL`

### CI

- `PLAYWRIGHT_BASE_URL`

## 7. 로컬 실행 방법

1. 의존성을 설치합니다.

```bash
npm install
```

2. 개발 서버를 실행합니다.

```bash
npm run dev
```

3. 빌드와 린트를 확인합니다.

```bash
npm run build
npm run lint
```

Windows PowerShell 실행 정책으로 `npm.ps1`이 막히면 다음처럼 실행합니다.

```bash
cmd /c npm run build
cmd /c npm run lint
```
