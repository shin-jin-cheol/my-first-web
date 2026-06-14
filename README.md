# my-first-web

## 1. 프로젝트 소개

`my-first-web`는 개인 블로그와 회원 기반 게스트 커뮤니티를 함께 제공하는 Next.js 애플리케이션입니다. 블로그/게스트 게시판, 댓글과 대댓글, 친구 관계, 1:1 실시간 채팅, 알림, 프로필, 파일/이미지 첨부를 App Router와 Server Actions 중심으로 구성합니다.

인증은 Supabase Auth가 아니라 자체 `sjc-session` 쿠키와 이메일 OTP 회원가입 흐름을 사용하며, 권한 검증은 `proxy.ts`, Server Action, `lib/permissions.ts`에서 처리합니다.

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

## 4. 페이지별 기능 안내

### 홈/게시판 탐색

#### `/`

홈 화면과 주요 진입점을 제공하는 첫 페이지입니다.

- 히어로 이미지와 소개 문구 표시
- `/posts`, `/posts/new` 빠른 이동
- 전역 헤더, 테마/언어, 알림, BGM, 모바일 내비게이션 흐름 진입

#### `/posts`

블로그 게시글과 커뮤니티 글을 함께 탐색하는 게시글 목록입니다.

- owner 블로그 게시글 목록 표시
- 회원 블로그 글과 게스트 게시글을 커뮤니티 영역으로 통합 표시
- 최신순, 조회수순, 좋아요순, 댓글순 정렬
- 카테고리 필터와 제목/내용/작성자 검색
- 작성자 아바타, 조회수, 좋아요 수, 댓글 수 표시
- 목록 로딩 중 스켈레톤 UI 표시

#### `/guest`

회원이 작성한 게스트 게시글을 탐색하고 관리하는 게시판입니다.

- 게스트 게시글 목록 표시
- 최신순, 조회수순, 좋아요순, 댓글순 정렬
- 카테고리 필터와 제목/내용/작성자 검색
- 회원은 `/guest/new`로 새 게스트 글 작성
- owner 또는 작성자는 목록에서 게스트 글 수정/삭제 가능
- owner 아바타와 회원 아바타 표시

### 게시글 상세/작성/수정

#### `/posts/[id]`

블로그 게시글 상세를 읽고 상호작용하는 페이지입니다.

- 게시글 본문, 카테고리, 작성자, 작성일, 조회수 표시
- 게시글 이미지, 링크, 파일 다운로드, HTML 첨부, YouTube iframe 임베드 표시
- 게시글 이모지 반응
- 댓글, 대댓글, 댓글 이모지 반응
- 로그인 사용자는 댓글 작성, 작성자/owner는 수정 및 삭제
- owner/member 프로필 사진과 프로필 링크 표시

#### `/posts/new`

owner가 블로그 게시글을 작성하는 페이지입니다.

- owner가 아니면 `/guest/new`로 이동
- 제목, 작성자, 카테고리, 본문 입력
- 링크, YouTube URL, 파일, 게시글 이미지 첨부
- 이미지 업로드 시 10MB 제한과 미리보기 제공
- 작성 중 내용은 `localStorage`에 임시 저장

#### `/posts/[id]/edit`

권한이 있는 사용자가 블로그 게시글을 수정하는 페이지입니다.

- 작성자/owner 권한 확인 후 접근
- 제목, 작성자, 카테고리, 본문 수정
- 링크, YouTube URL, 첨부파일 교체 또는 제거
- 게시글 이미지 교체 또는 제거
- 저장 후 상세 페이지 흐름으로 복귀

#### `/guest/[id]`

게스트 게시글 상세를 읽고 상호작용하는 페이지입니다.

- 게스트 게시글 본문, 카테고리, 작성자, 작성일, 조회수 표시
- 게시글 이미지, 링크, 파일 다운로드, HTML 첨부, YouTube iframe 임베드 표시
- 게시글 이모지 반응
- 댓글과 대댓글 표시, `parent_id` 기반 대댓글 들여쓰기 반영
- 댓글 작성자가 owner인 경우 게시글 작성자와 무관하게 owner 프로필 사진 표시
- 댓글 삭제 후 댓글 수 감소 fallback 로직 유지
- 작성자/owner는 게시글 및 댓글 수정/삭제 가능

#### `/guest/new`

회원이 게스트 게시글을 작성하는 페이지입니다.

- member만 접근 가능하며, owner는 `/guest`로 이동
- 제목, 카테고리, 본문 입력
- 링크, YouTube URL, 파일, 게시글 이미지 첨부
- 이미지 업로드 시 10MB 제한과 미리보기 제공
- 작성 중 내용은 `localStorage`에 임시 저장

#### `/guest/[id]/edit`

권한이 있는 사용자가 게스트 게시글을 수정하는 페이지입니다.

- 작성자/owner 권한 확인 후 접근
- 제목, 카테고리, 본문 수정
- 링크, YouTube URL, 첨부파일 교체 또는 제거
- 게시글 이미지 교체 또는 제거

#### `/guest/account`

회원 계정 정보를 관리하는 페이지입니다.

- member만 접근 가능
- 회원 이름 수정
- 비밀번호 변경
- 회원 탈퇴
- 처리 결과와 오류 메시지 표시

### 친구/채팅

#### `/friends`

친구 검색, 요청, 수락, 삭제와 채팅방 진입을 제공하는 페이지입니다.

- owner와 회원 이름 검색
- 검색 결과에서 프로필 보기 및 친구 요청
- 받은 친구 요청 수락/거절
- 친구 목록 표시 및 친구 삭제
- 친구별 1:1 채팅 버튼 제공
- 채팅 버튼과 삭제 버튼을 오른쪽 액션 영역에 고정 정렬

#### `/chat/[roomId]`

친구 간 1:1 실시간 채팅 전체모드 페이지입니다.

- 세션과 채팅방 참여자 권한 검증
- Supabase Realtime 기반 메시지 INSERT/UPDATE 반영
- 텍스트 메시지와 이미지 메시지 전송
- 상대방 이름과 아바타 표시
- 메시지 자동 스크롤
- 내가 보낸 메시지의 읽지 않음 상태를 `1`로 표시
- 전체모드와 전역 플로팅 채팅창 흐름 지원
- BGM 플레이어 최소화/펼침 상태와 채팅창 위치 연동

### 프로필

#### `/profile/[id]`

owner 또는 회원의 공개 프로필 페이지입니다.

- 프로필 이름, 가입일, 아바타 표시
- 본인 프로필에서는 아바타 업로드
- owner 프로필은 블로그 게시글 목록 표시
- member 프로필은 게스트 게시글 목록 표시
- 로그인 사용자는 친구 요청, 요청 취소, 수락, 거절, 친구 삭제 가능

### 인증

#### `/auth/login`

로그인 페이지입니다.

- 아이디와 비밀번호로 로그인
- 회원 탈퇴 완료, 회원가입 완료, 로그인 실패 메시지 표시
- 회원가입 페이지로 이동

#### `/auth/signup`

이메일 인증 기반 회원가입 페이지입니다.

- 이름, 아이디, 이메일 입력
- 이메일 인증 코드 전송
- 인증 코드 재전송 60초 제한 안내
- 인증 코드 확인 후 비밀번호 생성
- 비밀번호 규칙 안내와 입력 검증 UI 제공

### 관리자

#### `/admin/members`

owner 전용 회원 계정 관리 페이지입니다.

- owner 계정 정보 표시
- 회원 이름, ID, 가입일 목록 표시
- 회원 비밀번호는 마스킹 처리

## 5. 환경변수 목록

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

## 6. 로컬 실행 방법

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
