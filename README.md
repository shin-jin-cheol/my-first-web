# my-first-web

Next.js 16 App Router 기반의 개인 블로그 + 게스트 커뮤니티 프로젝트입니다.

## 1. 프로젝트 소개

이 프로젝트는 개인 블로그 운영과 회원 기반 게스트 커뮤니티 기능을 함께 제공하는 웹 애플리케이션입니다.

- Owner 중심 블로그 게시글 CRUD
- Member/Owner 게스트 게시판 CRUD
- 회원가입, 로그인, 계정 관리, 회원 탈퇴
- 댓글, 대댓글, 게시글/댓글 이모지 반응
- 친구 요청, 수락/거절, 친구 목록 관리
- 친구 간 1:1 라이브 채팅
- 친구 요청/댓글/채팅 Realtime 알림
- 카테고리, 검색, 파일 첨부, 링크 첨부, 게시글 이미지 첨부
- 이름 기반 프로필 아바타 표시
- 공개 프로필 페이지(`/profile/[id]`)
- 친구 페이지(`/friends`)
- 채팅 페이지(`/chat/[roomId]`)
- 알림 드롭다운과 nav 안읽음 뱃지
- Supabase, Vercel Blob, 로컬 JSON fallback 저장 전략

기본 구조는 Server Component 우선이며, 이벤트 처리와 브라우저 상태가 필요한 UI에만 Client Component를 사용합니다.

## 2. 기술 스택

- Framework: Next.js 16.2.1, App Router
- UI: React 19.2.4, React DOM 19.2.4
- Language: TypeScript ^5
- Styling: Tailwind CSS ^4, CSS variables
- Lint: ESLint ^9, eslint-config-next 16.2.1
- UI Components: shadcn/ui, Radix UI, lucide-react
- Utilities: class-variance-authority, clsx, tailwind-merge, tw-animate-css
- Backend: Supabase REST/Auth/Storage
- Realtime: Supabase Realtime messages/notifications 구독
- File Storage: Supabase Storage, Vercel Blob, Local fallback
- E2E: Playwright, GitHub Actions
- Deployment: Vercel

상세 버전은 `package.json`을 기준으로 합니다.

## 3. 주요 기능

### 콘텐츠

- 블로그 게시글 작성/조회/수정/삭제
- 게스트 게시글 작성/조회/수정/삭제
- `/posts` 목록 Supabase 또는 local fallback 연결
- `/posts/[id]` 상세 연결
- `/posts/new` 작성 연결
- 작성자에게만 수정/삭제 UI 표시
- 카테고리 분류
- 게시글 검색
- 파일 첨부, 링크 첨부, 본문 이미지 첨부
- 게시글 작성/수정 시 이미지 업로드
- 블로그/게스트 게시글 본문 이미지 표시
- KST 기준 날짜/시간 표시

### 댓글과 반응

- 블로그 게시글 댓글 작성/수정/삭제
- 게스트 게시글 댓글 작성/수정/삭제
- `parent_id` 기반 대댓글
- 게시글 이모지 반응
- 댓글 이모지 반응
- 작성자 이름 기반 이니셜 색상 아바타
- 게시글 작성자와 댓글 작성자 프로필 링크
- 이름 기반 기본 아바타와 업로드형 프로필 사진 표시

### 인증/권한

- 로그인
- 이메일 인증 코드 기반 회원가입
- 회원 프로필 이름 수정
- 회원 비밀번호 변경
- 회원 탈퇴
- Owner 전용 회원 관리 페이지
- Owner/Member 권한 기반 게시글 및 댓글 관리
- 자체 세션 쿠키 서명 검증과 `proxy.ts` 보호 라우트 차단
- `owner_settings` 기반 오너 아바타 저장/조회

### 친구

- `/friends` 친구 페이지
- 사용자 이름 검색(owner 포함)
- 받은 친구 요청 수락/거절
- 친구 목록 조회
- 친구 삭제
- `/profile/[id]` 친구 요청/수락/거절/삭제 버튼
- `proxy.ts` 기반 `/friends` 보호 라우트

### 라이브 채팅

- 친구 목록에서 채팅방 생성/진입
- `/chat/[roomId]` 1:1 채팅 페이지
- 초기 메시지는 Server Component에서 조회
- 메시지 전송은 Server Action에서 세션과 참여자 권한 검증 후 처리
- `ChatWindow`와 `ChatPanel` Client Component에서 Supabase Realtime `messages` INSERT 구독
- Enter 키 메시지 전송
- 새 메시지 수신 시 자동 스크롤
- 채팅방 상단 상대방 이름과 아바타 표시
- 채팅 사진 전송
- 메시지 아바타 1분 기준 그룹핑
- 데스크탑/모바일 플로팅 및 최소화 전환
- `ChatContext` 기반 채팅 전역 상태 관리
- `GlobalChatWindow` 기반 전역 플로팅 채팅
- `PlayerContext` 기반 뮤직 플레이어 최소화 상태 연동
- 채팅 Realtime 연결은 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용
- 채팅 테이블명은 `lib/env.ts` 상수로 중앙 관리
- `proxy.ts` 기반 `/chat` 보호 라우트

### 알림

- `notifications` 테이블 기반 알림 저장
- 친구 요청, 댓글, 채팅 메시지 전송 시 알림 생성
- nav 알림 아이콘과 안읽음 뱃지 표시
- 알림 드롭다운 UI
- Supabase Realtime `notifications` INSERT 구독으로 실시간 반영
- 알림 클릭 시 대상 링크 이동과 읽음 처리
- 모두 읽음 처리
- 티파니 블루 시그니처 컬러 CSS variables 적용

### 보안/안정화

- `SESSION_SECRET` 기반 세션 서명
- Owner 로그인 비밀번호 SHA-256 해시 비교
- Supabase Auth 회원 로그인 및 이메일 인증 연동
- 회원 비밀번호 정책 검증
- 환경 변수 중앙화
- `lib/env.ts` 환경 변수 중앙화 강화
- `lib/supabase/http.ts` try/catch 기반 에러 처리 추가
- `proxy.ts` 세션 서명 검증 강화
- 안전한 JSON 파싱
- 권한 체크 공통화
- 첨부/링크 URL 정규화
- CSS variables 통일 및 `text-white` 제거
- `service_role` 키가 클라이언트 번들에 노출되지 않도록 알림/채팅/게시글 이미지 쓰기 작업은 서버 경로에서 처리

### 사용자 경험

- 다크/라이트 시스템 테마 전환
- 모바일 대응 UI
- 다국어(ko/en) 언어 처리
- BGM 플레이어
- 라이브 시계
- 게시글 목록 스크롤 애니메이션(`ScrollReveal` 컴포넌트)
- 네비게이션 바 간결화
- `PostsMenu.tsx` 기반 "게시글" 드롭다운
- 모바일 내비게이션 친구 링크
- 햄버거 메뉴 친구/채팅 통합
- 내 프로필 텍스트 정리
- 회원가입 버튼 제거
- 글쓰기 버튼 텍스트를 "새 글 쓰기"로 통일
- 회원정보 나가기 버튼을 홈 이동으로 정리
- 공개 프로필 페이지(`/profile/[id]`)
  - owner: 블로그 게시글 목록
  - member: 게스트 게시글 목록
  - 진입 경로: nav 아바타, 게시글 작성자, 댓글 작성자
- 프로필 아바타 업로드 버튼과 owner 아바타 반영
- 게시글/댓글 목록과 상세 작성자 아바타에 owner 아바타 반영
- 홈 버튼 제거 후 제목 링크로 홈 진입
- 게시물 햄버거 버튼과 새 글 쓰기 버튼 텍스트 스타일 개선
- 로그아웃 버튼 옆 이름 표시와 프로필 링크 추가
- 첨부파일 UI 하단 잘림 수정
- 테마/언어 설정 토글 스타일 개선
- BGM 정지 후 클릭 재생 버그 수정
- 모바일 뮤직 플레이어 중앙 정렬
- 모바일 footer 하단 여백 조정
- 모바일 nav 제목 중앙 정렬
- 모바일 버튼 줄바꿈 방지
- 채팅창 카드 둥근 모서리와 footer 겹침 방지
- 모바일 채팅/뮤직 최소화 탭 위치 조정

### 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_OWNER_SETTINGS_TABLE`
- `SUPABASE_AVATARS_BUCKET`
- `SUPABASE_CHAT_IMAGES_BUCKET`
- `SUPABASE_POST_IMAGES_BUCKET`
- `SUPABASE_NOTIFICATIONS_TABLE`

## 4. 프로젝트 구조

```text
my-first-web/
├─ app/                         # App Router 페이지와 Server Actions
│  ├─ auth/                     # 로그인/회원가입
│  ├─ posts/                    # 블로그 목록/상세/작성/수정
│  ├─ guest/                    # 게스트 목록/상세/작성/수정/계정
│  ├─ friends/                  # 친구 검색/요청/목록 관리
│  ├─ chat/                     # 1:1 라이브 채팅
│  ├─ profile/                  # 공개 프로필 페이지
│  ├─ admin/                    # 관리자 페이지
│  └─ components/               # 앱 전용 컴포넌트
├─ components/                  # 공통 컴포넌트
├─ components/ui/               # shadcn/ui 컴포넌트
├─ lib/
│  ├─ auth/                     # 인증 core/session/login/signup/account/admin
│  ├─ supabase/                 # Supabase HTTP/클라이언트 유틸
│  ├─ posts.ts                  # 블로그 저장소, 댓글, 반응 로직
│  ├─ guest-posts.ts            # 게스트 저장소, 댓글, 반응 로직
│  ├─ friends.ts                # 친구 CRUD 로직
│  ├─ chat.ts                   # 채팅방/메시지 CRUD 로직
│  ├─ notifications.ts          # 알림 CRUD 로직
│  ├─ storage.ts                # Supabase Storage/Blob/로컬 저장 공통
│  ├─ permissions.ts            # 권한 체크
│  ├─ avatar-utils.ts           # 이름 기반 아바타 유틸
│  ├─ env.ts                    # 환경 변수 중앙화
│  └─ 기타 유틸
├─ data/                        # 로컬 JSON 데이터
├─ docs/                        # SQL/개발 문서
└─ types/                       # 공통 타입
```

## 5. 데이터 저장 구조

Supabase가 설정되어 있으면 Supabase를 우선 사용하고, 설정이 부족한 개발/점검 상황에서는 Vercel Blob 또는 로컬 JSON fallback을 사용합니다.

### 주요 테이블

- `members`: 회원 정보, 이메일 인증 상태, Supabase Auth 사용 시 연결 정보
- `posts`: 블로그 게시글
- `guest_posts`: 게스트 게시글
- `post_comments`: 블로그 댓글과 대댓글
- `guest_post_comments`: 게스트 댓글과 대댓글
- `post_reactions`: 블로그 게시글 이모지 반응
- `post_comment_reactions`: 블로그 댓글 이모지 반응
- `guest_post_reactions`: 게스트 게시글 이모지 반응
- `guest_comment_reactions`: 게스트 댓글 이모지 반응
- `friends`: 친구 요청과 친구 관계
- `chat_rooms`: 1:1 채팅방. `user_a_id < user_b_id` 정렬과 `(user_a_id, user_b_id)` 유니크 제약 사용
- `messages`: 채팅 메시지. `room_id`는 `chat_rooms(id)`를 참조하고 Supabase Realtime publication에 등록
- `notifications`: 친구 요청/댓글/채팅 알림. Supabase Realtime publication에 등록
- `storage.objects`: Supabase Storage 첨부 파일

### 주요 Storage 버킷

- `uploads`: 일반 파일 첨부
- `avatars`: 프로필 아바타
- `chat-images`: 채팅 사진 전송
- `post-images`: 블로그/게스트 게시글 본문 이미지

## 6. 환경 변수 목록

`lib/env.ts`에서 중앙 관리하는 값과 일부 Next.js/Supabase 클라이언트에서 직접 참조하는 값입니다.

### Supabase

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 브라우저의 Supabase Realtime 채팅 구독에도 사용합니다.

### Supabase 테이블/버킷 옵션

- `SUPABASE_MEMBERS_TABLE` (default: `members`)
- `SUPABASE_POSTS_TABLE` (default: `posts`)
- `SUPABASE_GUEST_POSTS_TABLE` (default: `guest_posts`)
- `SUPABASE_POST_COMMENTS_TABLE` (default: `post_comments`)
- `SUPABASE_GUEST_POST_COMMENTS_TABLE` (default: `guest_post_comments`)
- `SUPABASE_FRIENDS_TABLE` (default: `friends`)
- `SUPABASE_OWNER_SETTINGS_TABLE` (default: `owner_settings`)
- `SUPABASE_CHAT_ROOMS_TABLE` (default: `chat_rooms`)
- `SUPABASE_MESSAGES_TABLE` (default: `messages`)
- `SUPABASE_NOTIFICATIONS_TABLE` (default: `notifications`)
- `SUPABASE_UPLOADS_BUCKET` (default: `uploads`)
- `SUPABASE_AVATARS_BUCKET` (default: `avatars`)
- `SUPABASE_CHAT_IMAGES_BUCKET` (default: `chat-images`)
- `SUPABASE_POST_IMAGES_BUCKET` (default: `post-images`)

### 파일/세션/운영

- `BLOB_READ_WRITE_TOKEN`
- `SESSION_SECRET`
- `OWNER_ID`
- `OWNER_PASSWORD`
- `OWNER_NAME`
- `NODE_ENV`
- `VERCEL`

`OWNER_PASSWORD`는 Owner 로그인에서 입력 비밀번호를 SHA-256으로 해시한 값과 비교합니다.

## 7. 로컬 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

3. 빌드

```bash
npm run build
```

4. 린트

```bash
npm run lint
```

Windows PowerShell에서 실행 정책 이슈가 있으면 다음 형식을 사용합니다.

```bash
cmd /c npm run build
cmd /c npm run lint
```

5. E2E

GitHub Actions에서는 `.github/workflows/e2e.yml`이 push 시 Playwright E2E를 실행합니다. 대상 URL은 GitHub Repository Variable `PLAYWRIGHT_BASE_URL`로 관리합니다.

## 8. 배포 정보

- 배포 플랫폼: Vercel
- 기본 배포 브랜치: `master`
- 배포 명령 예시:

```bash
npx vercel --prod
```

- 현재 README에 기재되어 있는 배포 주소:
  - https://my-first-web-ten-phi.vercel.app

## 9. 개발 과정에서 적용한 것들

### 보안/안정화

- 환경 변수 접근 중앙화(`lib/env.ts`)
- `lib/env.ts` 환경 변수 중앙화 강화
- 세션 서명 유틸(`lib/auth/session.ts`)
- Supabase Auth 연동(`lib/auth/core.ts`)
- Owner 비밀번호 해시 비교(`lib/auth/login.ts`)
- 안전한 JSON 파싱 유틸(`lib/safe-json.ts`)
- redirect 에러 처리 유틸(`lib/redirect-error.ts`)
- 권한 체크 공통화(`lib/permissions.ts`)
- URL/첨부 관련 정규화 유틸(`lib/attachment-utils.ts`)
- 친구 CRUD 로직(`lib/friends.ts`)
- friends 테이블 RLS 마이그레이션(`supabase/migrations/20260521055613_add_friends_table.sql`)
- 채팅 CRUD 로직(`lib/chat.ts`)
- chat_rooms/messages 테이블 마이그레이션(`supabase/migrations/20260529004057_add_chat_tables.sql`)
- messages 이미지 컬럼 마이그레이션(`supabase/migrations/20260530190901_add_image_url_to_messages.sql`)
- 알림 CRUD 로직(`lib/notifications.ts`)
- notifications 테이블 마이그레이션(`supabase/migrations/20260530205656_add_notifications_table.sql`)
- posts/guest_posts 이미지 컬럼 마이그레이션(`supabase/migrations/20260530000000_add_image_url_to_posts.sql`)
- CSS variables 통일 및 `text-white` 제거

### 코드 구조 개선

- 인증 로직 모듈 분리(`lib/auth/*`)
- Server Actions 분리(`app/auth/actions.ts`, `app/posts/actions.ts`, `app/guest/actions.ts`)
- 친구 Server Actions 분리(`app/friends/actions.ts`)
- 채팅 메시지 전송 Server Action 분리(`app/chat/[roomId]/actions.ts`)
- 알림 Server Actions 분리(`app/components/notification-actions.ts`)
- 게시글/댓글/반응 저장소 로직 분리(`lib/posts.ts`, `lib/guest-posts.ts`)
- 카테고리/첨부/검색/댓글 조회 중복 로직 유틸화
- 공통 타입 분리(`types/posts.ts`)

### 운영 관련

- Server Component 우선 구조 유지
- Supabase 우선 + Blob/로컬 fallback 저장 전략
- 데이터 변경 후 `revalidatePath` 기반 화면 동기화
- `proxy.ts` 기반 보호 라우트
- `proxy.ts` 세션 서명 검증 강화
- `/friends` 보호 라우트 추가
- `/chat` 보호 라우트 추가
- Supabase Realtime `messages` 테이블 등록
- Supabase Realtime `notifications` 테이블 등록
- `lib/supabase/http.ts` try/catch 기반 에러 처리 추가
- GitHub Actions Playwright E2E workflow 추가(`.github/workflows/e2e.yml`)

### UI/UX 개선

- 게시글 목록 스크롤 애니메이션(`ScrollReveal` 컴포넌트)
- 네비게이션 바 간결화
- `PostsMenu.tsx` 신규 추가 및 "게시글" 드롭다운 구성
- 회원가입 버튼 제거
- 글쓰기 버튼 텍스트 "새 글 쓰기" 통일
- 공개 프로필 페이지(`/profile/[id]`) 추가
- nav 아바타, 게시글 작성자, 댓글 작성자에서 프로필 진입 지원
- `/profile/[id]` 친구 요청/수락/거절/삭제 버튼 추가
- 프로필 아바타 업로드 버튼과 owner 아바타 반영
- 게시글/댓글/상세 작성자 아바타에 owner 아바타 반영
- `/friends` 친구 검색/요청 관리/목록 페이지 추가
- `NavMenuMobile.tsx` 친구 링크 추가
- 친구 목록 채팅 버튼(`app/friends/FriendChatButton.tsx`) 추가
- 데스크탑/모바일 내비게이션 채팅 진입 링크 추가
- `/chat/[roomId]` 라이브 채팅 UI 추가
- `GlobalChatWindow` 전역 플로팅 채팅 추가
- 채팅 사진 전송 UI 추가
- 알림 벨과 드롭다운 UI 추가
- 게시글/게스트 게시글 이미지 첨부 UI 추가
- 모바일 footer, nav, 최소화 탭, 버튼 줄바꿈 등 모바일 최적화 반영

### 참고 문서

- `docs/refactoring-summary.md`
- `docs/supabase-members.sql`
- `docs/supabase-content.sql`
- `docs/supabase-board-stability.sql`
