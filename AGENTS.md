<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.2.1. APIs, conventions, and file structure may differ from older Next.js versions. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` and follow deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## 0-1. 2026-06-10 최신 반영 기록

- `lib/supabase/client.ts`는 브라우저 Supabase 클라이언트 생성에 필요한 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 `process.env`에서 직접 읽지 않고 `lib/env.ts`에서 import해서 사용합니다.
- `/friends` 친구 목록 카드에서 `FriendChatButton`과 친구 삭제 form을 하나의 `flex shrink-0 items-center gap-2` 액션 영역으로 묶어 이름 길이와 관계없이 오른쪽에 고정 배치합니다.
- 인증 문서 표현은 현재 구조 기준으로 정리합니다. 이 프로젝트는 Supabase Auth가 아니라 자체 `sjc-session` 쿠키와 이메일 OTP를 사용하며, 권한 검증은 `proxy.ts`, Server Action, `lib/permissions.ts`에서 수행합니다.
- 현재 GitHub Actions workflow는 `.github/workflows/e2e.yml`과 `.github/workflows/playwright.yml`이 함께 존재합니다. Playwright E2E 관련 문서에는 두 파일의 존재를 함께 반영합니다.

## 0. 2026-05-31 최신 반영 기록

이번 문서 업데이트는 모바일 첫인상 개선, 채팅 모바일 최적화, UI 레이아웃 개편, 성능 최적화, 게시글 필터/정렬, 최근 채팅/BGM UI 수정사항을 반영합니다.

- 모바일 첫 접속 시 BGM 플레이어는 최소화 상태로 시작합니다.
- 오프라인 감지 배너가 추가되었습니다.
- 채팅 페이지를 제외한 모바일 화면에서 스크롤 방향에 따라 nav가 숨김/표시됩니다.
- 모바일 채팅 전체화면에서는 nav 고정, 입력창 16px 이상 폰트 크기 적용, 이미지 탭 확대 보기, 플로팅 전환 시 이전 페이지 복귀 흐름을 지원합니다.
- `PostNewForm`, `GuestNewForm`은 작성 중 내용을 `localStorage`에 자동 저장합니다.
- 모바일 최소화 탭은 채팅/음악 상태를 좌우 배열로 표시하고, 모바일 footer는 더 작게 정리되었습니다.
- 화면 상태에 따라 `채팅 중`, `재생 중`, `음악` 표시가 자동 전환됩니다.
- UI 텍스트는 `뮤직` 대신 `음악`을 사용합니다.
- 게시글/채팅 이미지 업로드는 canvas API 기반 자동 리사이징을 거치며 최대 1200px 기준으로 축소됩니다.
- 게시글, 게스트 게시판, 친구 목록에는 스켈레톤 UI가 적용되었습니다.
- 게시글 목록 정렬은 `latest`, `views`, `likes`, `comments`를 URL `searchParams` 기반으로 처리하며 카테고리 필터와 함께 사용할 수 있습니다.
- 실제 DB 컬럼 기준으로 조회순은 `views` 컬럼을 사용하고, `like_count`, `comment_count`는 좋아요/댓글 추가 및 삭제 시 자동 갱신됩니다.
- 채팅 전체화면 카드 스타일은 둥근 모서리가 보이도록 하단 여백을 조정했습니다.
- 플로팅 채팅창은 `PlayerContext.isMinimized` 상태와 연동해 BGM 플레이어 최소화/펼침 상태에 따라 위치가 조정됩니다.
- 플로팅 채팅창에도 Supabase Realtime 메시지 구독을 추가했습니다.
- 데스크탑 BGM/채팅 최소화 탭은 footer 위에 겹치지 않도록 정렬됩니다.
- BGM 펼침 상태에서는 모바일/데스크탑 채팅창과 채팅 탭을 플레이어 위로 올립니다.
- 모바일 nav 제목 중앙 정렬과 모바일 footer 하단 여백 조정이 반영되었습니다.

## 1. 프로젝트 개요

이 프로젝트는 개인 블로그와 게스트 커뮤니티 기능을 함께 제공하는 Next.js 애플리케이션입니다.

- 블로그 게시글 CRUD
- 게스트 게시판 CRUD
- 회원가입, 로그인, 회원 관리
- 자체 세션 쿠키 인증
- 이메일 OTP 회원가입/로그인
- 댓글 기능
- 친구 요청/수락/거절/삭제 기능
- 친구 간 1:1 라이브 채팅 기능
- 친구 요청/댓글/채팅 기반 Realtime 알림 기능
- 채팅 이미지 전송 및 게시글 본문 이미지 첨부 기능
- 카테고리 시스템
- 파일 업로드
- 다국어 텍스트 처리
- posts 테이블 RLS 활성화 및 작성자 기반 정책 적용
- Ch13 이후 posts 쓰기 정책은 자체 세션 쿠키 인증과 service_role 서버 요청 흐름에 맞춰 서버 사이드 권한 검증 기반으로 운영
- Ch13 이후 guest_posts 테이블은 서버 사이드 권한 검증을 기준으로 RLS 비활성화
- Supabase HTTP client pattern, Supabase Storage, Vercel Blob, local fallback 기반 데이터 및 파일 저장
- Vercel 프로덕션 배포

주요 라우트는 App Router 기반입니다.

- `/`: 홈, 최신 글 목록
- `/posts`, `/posts/[id]`, `/posts/new`, `/posts/[id]/edit`: 블로그
- `/guest`, `/guest/[id]`, `/guest/new`, `/guest/[id]/edit`, `/guest/account`: 게스트 게시판
- `/friends`: 친구 검색, 받은 요청 수락/거절, 친구 목록 관리
- `/chat/[roomId]`: 친구 간 1:1 라이브 채팅
- `/profile/[id]`: 공개 프로필 및 친구 요청/수락/거절/삭제
- `/auth/login`, `/auth/signup`: 인증
- `/admin/members`: 관리자 회원 관리
- `.github/workflows/e2e.yml`: GitHub Actions Playwright E2E 자동 실행

보호 라우트는 루트의 `proxy.ts`에서 자체 세션 쿠키를 확인합니다.

- `/posts/new`
- `/guest/new`
- `/guest/account`
- `/friends`
- `/chat/:path*`
- `/admin/:path*`

비로그인 사용자는 보호 라우트 접근 시 `/auth/login`으로 리다이렉트됩니다.

## 2. 기술 스택

- Framework: Next.js 16.2.1, App Router only
- UI: React 19.2.4
- Styling: Tailwind CSS 4, CSS variables
- UI Components: shadcn/ui under `components/ui/`
- Backend: Supabase HTTP client pattern
- Auth: 자체 세션 쿠키 + 이메일 OTP
- File Storage: Supabase Storage, Vercel Blob, local fallback
- Realtime: Supabase Realtime messages/notifications 구독
- Deployment: Vercel
- Language: TypeScript
- Lint: ESLint 9, `eslint-config-next` 16.2.1

## 3. 반드시 읽어야 할 규칙 파일 목록

작업 전 아래 파일을 먼저 읽고 현재 작업에 적용해야 합니다.

- `ARCHITECTURE.md`
- `context.md`
- `.github/copilot-instructions.md`
- `.agent/rules/project.md`
- 작업 주제와 관련된 `node_modules/next/dist/docs/` 문서

작업 내용이 Supabase, storage, hydration, Server Actions, routing, cache, config, proxy와 관련되면 반드시 해당 Next.js 로컬 문서를 먼저 확인합니다.

## 4. 코딩 컨벤션

- App Router만 사용합니다. `pages/` Router API를 사용하지 않습니다.
- Next.js 16 기준 보호 라우트 처리는 `middleware.ts`가 아니라 `proxy.ts`를 사용합니다.
- 기본은 Server Component입니다.
- `"use client"`는 브라우저 API, 상태, 이벤트 핸들러가 필요한 경우에만 추가합니다.
- 데이터 처리와 Server Action은 `async/await` 기반으로 작성합니다.
- Server Action 흐름과 반환 구조를 임의로 변경하지 않습니다.
- 환경 변수는 `lib/env.ts`에서 중앙 관리합니다.
- Supabase HTTP 요청은 기존 `lib/supabase/http.ts` 패턴을 따릅니다.
- 인증은 Supabase Auth가 아니라 자체 세션 쿠키와 이메일 OTP 흐름을 유지합니다.
- 보안은 클라이언트 if문이나 UI 숨김으로만 처리하지 않고, DB에서 RLS로 강제합니다.
- 이 프로젝트는 Supabase Auth를 사용하지 않으므로 Supabase RLS의 `auth.uid()`는 자체 세션 쿠키 사용자 ID를 알 수 없고 null을 반환합니다.
- 따라서 작성/수정/삭제 권한은 `lib/permissions.ts`, `app/posts/actions.ts`, `app/guest/actions.ts`, `proxy.ts`에서 서버 사이드로 검증합니다.
- posts 테이블은 RLS를 유지하되 INSERT/UPDATE/DELETE는 service_role 기반 정책(`WITH CHECK (true)`)으로 열고, 권한 검증은 Server Action에서 수행합니다.
- guest_posts 테이블은 서버 사이드 권한 검증을 기준으로 RLS를 비활성화합니다.
- chat_rooms/messages 테이블은 서버 사이드 세션/참여자 권한 검증을 기준으로 RLS를 비활성화합니다.
- 채팅 Realtime 구독은 브라우저에서 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 생성한 Supabase 클라이언트를 사용합니다.
- RLS SQL은 반드시 `supabase/migrations/` 아래 마이그레이션으로 남깁니다.
- `service_role` 키는 클라이언트 컴포넌트나 브라우저 번들에서 사용하지 않습니다.
- FormData 문자열/숫자 처리는 `lib/form-utils.ts`를 우선 사용합니다.
- 저장소 및 파일 fallback 처리는 `lib/storage.ts`와 `lib/attachment-utils.ts`의 기존 흐름을 유지합니다.
- 날짜 처리는 `lib/date.ts`의 KST 유틸을 사용합니다.
- JSON 파싱은 `lib/safe-json.ts` 등 기존 안전 유틸을 우선 사용합니다.
- URL, 링크, 파일 검증은 기존 검증 유틸과 정책을 유지합니다.
- UI 컴포넌트는 가능한 `components/ui/`의 shadcn/ui 컴포넌트를 우선 사용합니다.
- Tailwind 기본 색상 직접 사용을 피하고 CSS variables를 우선 사용합니다.
- 기존 UI, 레이아웃, spacing, typography, 모바일 대응을 불필요하게 변경하지 않습니다.
- props와 반환 타입은 명확하게 정의합니다.
- 새 라이브러리는 사용자가 명시적으로 요청한 경우에만 추가합니다.

## 5. 절대 하면 안 되는 것들

- `next/router` 사용 금지
- Pages Router API 사용 금지: `getServerSideProps`, `getStaticProps`, `getInitialProps`
- `middleware.ts` 재도입 금지
- 불필요한 `"use client"` 추가 금지
- Server Action 흐름 임의 변경 금지
- 기존 API 응답 구조 또는 함수 반환값 임의 변경 금지
- 기존 UI/디자인/레이아웃 임의 변경 금지
- Tailwind 기본 색상 직접 사용 금지
- 하드코딩된 사용자 입력 신뢰 금지
- 인증/권한 검증 제거 금지
- Supabase Auth 전제의 인증 구조로 변경 금지
- 환경 변수를 각 파일에 흩어놓는 변경 금지
- 새 의존성 임의 추가 금지
- 사용자가 요청하지 않은 리팩터링 금지
- 사용자가 만든 변경을 임의로 되돌리기 금지
- 배포 전 검증 없이 완료 처리 금지

## 6. 작업 완료 후 반드시 실행할 명령어

코드 변경 후에는 아래 명령을 실행하고 결과를 보고합니다.

```bash
npm run build
npm run lint
```

Windows PowerShell 실행 정책으로 `npm.ps1`이 막히면 아래처럼 실행합니다.

```bash
cmd /c npm run build
cmd /c npm run lint
```

Next font 또는 Vercel 관련 네트워크 fetch가 필요한 경우에는 네트워크 권한을 허용받아 재실행합니다.

## 7. 브랜치 전략

- 기본 배포 브랜치: `master`
- 기능 작업은 목적이 분명한 별도 브랜치에서 진행합니다.
- 기존 브랜치를 사용하라는 명시가 없으면 작업명 기반 브랜치를 사용합니다.
- Codex에서 새 브랜치를 만들 때는 기본적으로 `codex/` prefix를 사용합니다.
- 사용자가 특정 브랜치명을 지정하면 그 지시를 우선합니다.
- 배포 요청 시에는 사용자가 지정한 순서를 그대로 따릅니다.
- `master` 머지는 사용자가 명시적으로 요청한 경우에만 수행합니다.
- 히스토리 파괴 명령은 금지합니다: `git reset --hard`, 강제 push 등.

## 8. 커밋 메시지 규칙

커밋 메시지는 변경 목적이 드러나는 Conventional Commits 형식을 사용합니다.

- `feat:` 새 기능
- `fix:` 버그 수정
- `refactor:` 동작 변경 없는 구조 개선
- `style:` UI 또는 스타일 조정
- `docs:` 문서 변경
- `chore:` 설정, 빌드, 기타 관리 작업
- `revert:` 이전 커밋 되돌리기

예시:

```text
fix: Server Actions body 크기 제한 10MB로 설정
refactor: storage 전략 통합
refactor: FormData 공통 유틸 추출 및 i18n 텍스트 처리
fix: ThemeToggle hydration mismatch 및 BGM 버튼 아이콘 이모지 방지 수정
docs: Ch9 완료 기준 프로젝트 문서 갱신
```

사용자가 커밋 메시지를 지정한 경우에는 지정된 메시지를 그대로 사용합니다.

## 9. Ch11 RLS 완료 기록

- posts 테이블 RLS가 활성화되었습니다.
- 적용 정책:
  - `posts_select_public`: SELECT 누구나 가능
  - `posts_insert_authenticated`: INSERT 로그인 사용자만 가능, `author_id = auth.uid()`
  - `posts_update_owner`: UPDATE 작성자만 가능
  - `posts_delete_owner`: DELETE 작성자만 가능
- 마이그레이션 파일: `supabase/migrations/20260520041504_add_posts_rls.sql`
- `npx supabase db push`로 원격 적용이 완료되었습니다.
- 테스트 결과:
  - 비로그인 사용자는 `/posts/new` 접근 시 `/auth/login`으로 리다이렉트됩니다.
  - 사용자 A는 본인이 작성한 posts 레코드의 수정/삭제만 허용됩니다.
  - 사용자 B가 사용자 A의 posts 레코드를 수정/삭제하는 우회 시도는 실패함을 확인했습니다.
- 민감 키 grep 검사가 통과했습니다.
- 클라이언트 컴포넌트에서 service_role 키를 사용하지 않음을 확인했습니다.

## 10. 친구 기능 완료 기록

- `lib/friends.ts` 친구 CRUD 함수가 추가되었습니다.
- `app/friends/actions.ts` 친구 기능 Server Actions가 추가되었습니다.
- `/friends` 페이지가 추가되었습니다.
  - 사용자 이름 검색에서 owner를 포함합니다.
  - 받은 친구 요청을 수락/거절할 수 있습니다.
  - 친구 목록 조회와 친구 삭제를 지원합니다.
- `/profile/[id]`에 친구 요청/수락/거절/삭제 버튼이 추가되었습니다.
- `app/components/NavMenuMobile.tsx`에 친구 링크가 추가되었습니다.
- `proxy.ts` 보호 라우트에 `/friends`가 추가되었습니다.
- Supabase `friends` 테이블과 RLS 정책이 추가되었습니다.
- 마이그레이션 파일: `supabase/migrations/20260521055613_add_friends_table.sql`
- `lib/env.ts`에 `SUPABASE_FRIENDS_TABLE` 상수가 추가되었습니다.

## 11. Ch13 버그 수정 및 아키텍처 결정 기록

- Supabase Auth 대신 자체 세션 쿠키를 사용하므로 `auth.uid()` 기반 RLS 쓰기 정책이 자체 로그인 사용자와 연결되지 않음을 확인했습니다.
- posts RLS INSERT/UPDATE/DELETE 정책을 auth.uid() 기반에서 service_role 기반으로 수정했습니다.
- posts 테이블은 RLS 활성화를 유지하고, SELECT는 공개 정책을 유지하며, INSERT/UPDATE/DELETE는 서버 사이드 권한 검증 후 service_role 요청으로 처리합니다.
- guest_posts 테이블은 서버 사이드 권한 검증을 기준으로 RLS를 비활성화했습니다.
- 권한 검증 위치:
  - `lib/permissions.ts`: 권한 체크 공통 함수
  - `app/posts/actions.ts`: 블로그 Server Action 세션/권한 검증
  - `app/guest/actions.ts`: 게스트 게시판 Server Action 세션/권한 검증
  - `proxy.ts`: 보호 라우트 차단
- posts_category_valid 제약 조건에 누락된 `notice` 카테고리를 추가했습니다.
- `lib/posts.ts` 레거시 카테고리 체크 코드를 제거했습니다.
- `lib/guest-posts.ts` 레거시 카테고리 체크 코드를 제거했습니다.
- 추가된 마이그레이션 파일:
  - `supabase/migrations/20260526164049_fix_posts_rls.sql`
  - `supabase/migrations/20260526170435_fix_posts_category_constraint.sql`
  - `supabase/migrations/20260526173544_disable_guest_posts_rls.sql`
- Ch13 검증 완료:
  - Playwright E2E 테스트 2개 통과
  - 보안 grep 3개 통과
  - Vercel 수동 검증 5개 완료
  - 검증 보고서: `docs/verification-report.md`

## 12. 라이브 채팅 기능 완료 기록

- `lib/chat.ts`에 `ChatRoom`, `Message` 타입과 `getOrCreateRoom()`, `getMessages()`, `sendMessage()`, `getRoom()`, `isChatRoomParticipant()` 함수가 추가되었습니다.
- `app/chat/[roomId]/page.tsx` Server Component 채팅 페이지가 추가되었습니다.
- `app/chat/[roomId]/ChatWindow.tsx` Client Component가 Supabase Realtime `messages` INSERT 이벤트를 구독합니다.
- `app/chat/[roomId]/actions.ts` 메시지 전송 Server Action이 추가되었습니다.
- `app/friends/FriendChatButton.tsx` 친구 목록 채팅 버튼이 추가되었습니다.
- `app/friends/actions.ts`에 `getChatRoomAction()`이 추가되었습니다.
- `app/friends/page.tsx` 친구 항목에서 채팅방 진입을 지원합니다.
- `app/components/PostsMenu.tsx`, `app/components/NavMenuMobile.tsx`에 로그인 사용자용 채팅 진입 링크가 추가되었습니다.
- `proxy.ts` 보호 라우트에 `/chat/:path*`가 추가되었습니다.
- Supabase `chat_rooms`, `messages` 테이블이 추가되었고, `messages` 테이블은 Supabase Realtime publication에 등록되었습니다.
- 마이그레이션 파일: `supabase/migrations/20260529004057_add_chat_tables.sql`
- Vercel 환경 변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 브라우저 Realtime 구독에 사용됩니다.

## 13. 오늘 반영된 추가 기록

- 프로필 아바타 업로드 버튼이 owner 프로필에서도 표시되도록 수정했습니다.
- `app/profile/[id]/AvatarUpload.tsx`의 Supabase 클라이언트 생성을 컴포넌트 내부로 옮겨 SSR 시점 env 접근 문제를 피했습니다.
- owner 프로필 아바타는 `owner_settings` 테이블의 `avatar_url` 값으로 저장/조회하도록 분리했습니다.
- `app/posts/page.tsx`, `app/posts/[id]/page.tsx`, `app/guest/page.tsx`, `app/guest/[id]/page.tsx`, `app/profile/[id]/page.tsx`에서 owner 아바타를 반영했습니다.
- `app/components/PostsSearchContent.tsx`, `app/components/GuestPostsSearchList.tsx`에서 불필요한 `"use client"`를 제거했습니다.
- 채팅 Realtime 구독은 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용하는 클라이언트로 유지합니다.
- `lib/supabase/http.ts`의 Supabase HTTP 요청은 try/catch 기반 에러 처리로 정리했습니다.
- `proxy.ts`는 자체 세션 쿠키 서명 검증을 통해 보호 라우트를 유지합니다.

## 14. 모바일 최적화, 채팅 개선, 알림, 이미지 첨부, E2E CI 반영 기록

- 첨부파일 UI 하단 잘림을 수정했습니다.
- 회원정보 나가기 버튼 동작을 홈 이동으로 정리했습니다.
- 햄버거 메뉴에서 친구/채팅 진입을 통합했고, 내 프로필 텍스트를 정리했습니다.
- 테마/언어 설정 토글 스타일을 정리했습니다.
- BGM 정지 후 클릭 재생 버그를 수정했습니다.
- 모바일 뮤직 플레이어와 최소화 탭을 중앙 정렬했습니다.
- 모바일 footer 하단 여백과 모바일 최소화 탭 간격을 조정했습니다.
- 모바일 nav 제목을 중앙 정렬했습니다.
- 모바일 버튼 텍스트 줄바꿈을 방지했습니다.
- 채팅 Enter 키 전송을 지원합니다.
- 채팅방 상단에 상대방 이름과 아바타를 표시합니다.
- 새 메시지 수신 시 메시지 목록을 자동 스크롤합니다.
- 채팅 사진 전송 기능을 추가했습니다.
- 데스크탑과 모바일에서 채팅 플로팅/최소화 전환을 지원합니다.
- 메시지 아바타는 1분 기준으로 그룹핑됩니다.
- 채팅창 카드 스타일과 둥근 모서리 표시를 정리했습니다.
- `ChatContext` 기반 채팅 전역 상태 관리를 추가했습니다.
- `GlobalChatWindow`를 추가했습니다.
- `PlayerContext` 기반 뮤직 플레이어 최소화 연동을 추가했습니다.
- Supabase Storage `chat-images` 버킷을 채팅 이미지 전송에 사용합니다.
- `notifications` 테이블을 추가하고 RLS를 비활성화했습니다.
- 친구 요청, 댓글, 채팅 메시지 전송 시 알림을 생성합니다.
- nav에 알림 아이콘과 안읽음 뱃지를 추가했습니다.
- 알림 드롭다운은 Supabase Realtime으로 실시간 반영됩니다.
- 알림 모두 읽음 처리를 지원합니다.
- 알림 UI에 티파니 블루 시그니처 컬러 CSS variables를 적용했습니다.
- `posts`, `guest_posts`에 `image_url` 컬럼을 추가했습니다.
- 게시글 작성/수정 시 이미지 업로드와 본문 이미지 표시를 지원합니다.
- Supabase Storage `post-images` 버킷을 게시글 이미지 첨부에 사용합니다.
- `.github/workflows/e2e.yml`을 추가해 GitHub Actions push 시 Playwright E2E를 실행합니다.
- GitHub Repository Variable `PLAYWRIGHT_BASE_URL`을 E2E 대상 URL로 사용합니다.
- `lib/env.ts`에 `SUPABASE_CHAT_IMAGES_BUCKET`, `SUPABASE_POST_IMAGES_BUCKET`, `SUPABASE_NOTIFICATIONS_TABLE` 상수가 추가되었습니다.
 
## 15. 2026-06-04 완료 반영 기록

- `lib/attachment-utils.ts`의 `ALLOWED_ATTACHMENT_MIME_TYPES`에 `text/html`을 추가해 HTML 파일 첨부를 허용했습니다.
- `app/components/BackButton.tsx`를 신규 추가했습니다.
  - Client Component입니다.
  - `usePathname()`으로 현재 경로를 확인하고 홈(`/`)에서는 렌더링하지 않습니다.
  - 홈을 제외한 모든 페이지 헤더에서 `router.back()` 기반 뒤로가기를 제공합니다.
  - 아이콘은 `lucide-react`의 `ArrowLeft`를 사용하며 기존 헤더 아이콘 버튼 스타일과 맞춥니다.
- `app/components/Header.tsx`의 모바일/데스크탑 사이트 타이틀 왼쪽에 `BackButton`을 배치했습니다.
- `app/chat/[roomId]/page.tsx` 채팅 전체모드 하단 여백을 기기별로 조정했습니다.
  - 기본(no prefix, 모바일 768px 미만): `bottom-14`
  - `md`/`lg`/`xl` 구간: `bottom-[165px]`
  - `2xl` 이상: `bottom-28`
  - 아이패드 11인치 1180px는 Tailwind `lg` 구간이므로 footer와 뮤직 플레이어 겹침을 피하기 위해 중간 화면 여백을 별도로 유지합니다.
- Tailwind breakpoint 기준:
  - 기본(no prefix): 768px 미만 모바일
  - `md`: 768px 이상
  - `lg`: 1024px 이상
  - `xl`: 1280px 이상
  - `2xl`: 1536px 이상

## 16. 2026-06-04 YouTube 영상 임베드 완료 기록

- YouTube 영상 임베드 기능을 추가했습니다.
- `posts`, `guest_posts` 테이블에 `youtube_url` 컬럼을 추가하는 마이그레이션을 작성했습니다.
- 마이그레이션 파일: `supabase/migrations/20260604000000_add_youtube_url_to_posts.sql`
- 블로그/게스트 게시글 작성, 수정, 상세 화면에서 YouTube URL 입력과 iframe 임베드를 지원합니다.
- 오너 블로그 게시글과 게스트 게시글 모두 같은 흐름으로 지원합니다.
- `watch?v=VIDEO_ID`, `youtu.be/VIDEO_ID` 형식의 영상 ID 추출을 지원합니다.
- URL 정규화, YouTube 도메인 검증, 영상 ID 추출, 임베드 URL 생성은 `lib/attachment-utils.ts`에서 처리합니다.
- `lib/posts.ts`, `lib/guest-posts.ts`는 `youtubeUrl` 필드를 `youtube_url` 컬럼과 매핑합니다.
- `app/posts/actions.ts`, `app/guest/actions.ts`는 `FormData`의 `youtubeUrl` 값을 저장 흐름으로 전달합니다.

## 17. 2026-06-04 채팅 메시지 읽음 표시 완료 기록

- 채팅 메시지 읽음 표시 기능을 추가했습니다.
- `messages` 테이블에 `is_read boolean not null default false` 컬럼을 추가하는 마이그레이션을 작성했습니다.
- 마이그레이션 파일: `supabase/migrations/20260604000001_add_is_read_to_messages.sql`
- 내가 보낸 메시지를 상대방이 아직 읽지 않았으면 말풍선 옆에 카카오톡 스타일 `1`을 표시합니다.
- 상대방이 읽으면 Supabase Realtime UPDATE 이벤트로 `1` 표시가 사라집니다.
- 전체모드와 플로팅 채팅창 모두 읽음 표시를 지원합니다.
- Realtime INSERT와 UPDATE 구독은 `ChatPanel`에서 별도 채널로 분리하고 실패 시 재구독합니다.
- Realtime UPDATE 누락을 보정하기 위해 채팅창 열림, 브라우저 탭 포커스 복귀, 플로팅 전환 시 `getMessageReadStatusesAction()`으로 서버의 최신 `id/is_read` 상태만 다시 동기화합니다.
- 관련 파일: `lib/chat.ts`, `app/chat/[roomId]/actions.ts`, `app/components/ChatPanel.tsx`, `app/components/GlobalChatWindow.tsx`
