# Architecture

## 0. 2026-05-31 최신 아키텍처 반영

### 모바일 첫인상 및 전역 UI

- `BgmPlayer`는 모바일 첫 진입 시 `PlayerContext`를 통해 최소화 상태로 시작합니다.
- `ClientLayout` 계층의 전역 UI는 오프라인 감지 배너와 스크롤 방향 기반 nav 숨김/표시를 담당합니다. 채팅 페이지에서는 채팅 사용성을 위해 nav 숨김 동작을 제외합니다.
- 모바일 footer는 더 낮은 높이와 작은 액션 영역으로 정리되었고, 모바일 nav 제목은 중앙 정렬됩니다.
- 채팅/음악 최소화 탭은 모바일에서 좌우 배열로 표시되며 상태에 따라 `채팅 중`, `재생 중`, `음악` 텍스트를 표시합니다.

### 채팅 레이아웃 및 Realtime

- `app/components/ChatPanel.tsx`는 전체화면과 플로팅 채팅이 공유하는 메시지 패널입니다.
- 채팅 입력창은 iOS 자동 확대를 막기 위해 16px 이상 폰트 크기를 유지합니다.
- 채팅 이미지는 메시지 영역에서 탭하면 모달 형태로 크게 볼 수 있습니다.
- `app/chat/[roomId]/ChatWindow.tsx`는 전체화면 진입 시 전역 채팅 상태를 fullscreen으로 설정하고, 최소화 전환 시 `router.back()`을 우선 사용해 이전 페이지로 돌아갑니다.
- `app/components/GlobalChatWindow.tsx`는 플로팅/최소화 채팅 UI를 담당하며, `PlayerContext.isMinimized`에 따라 BGM 플레이어와 겹치지 않게 bottom 값을 조정합니다.
- 플로팅 채팅창은 roomId별 Supabase Realtime `messages` INSERT 구독을 보강해 전체화면이 아닌 상태에서도 새 메시지를 반영합니다.
- 데스크탑에서는 footer 위에 BGM 최소화 탭을 배치하고, 그 위에 채팅 최소화 탭 또는 플로팅 채팅창을 배치합니다.
- 모바일에서 BGM 플레이어가 펼쳐진 경우 채팅 탭과 플로팅 채팅창을 플레이어 높이만큼 위로 올립니다.

### 작성/업로드/성능

- `PostNewForm`, `GuestNewForm`은 작성 중 내용을 `localStorage`에 자동 저장합니다.
- 게시글 및 채팅 이미지 업로드는 canvas API로 최대 1200px 기준 자동 리사이징을 수행합니다.
- 게시글 목록, 게스트 게시판 목록, 친구 목록에는 스켈레톤 UI가 적용되어 로딩 중 레이아웃 안정성을 높입니다.

### 게시글 필터/정렬과 카운트

- `lib/post-sort.ts`는 정렬 기준을 `latest`, `views`, `likes`, `comments`로 관리합니다.
- `/posts`, `/guest` 목록은 URL `searchParams` 기반 정렬을 사용하며 카테고리 필터와 동시에 동작합니다.
- 실제 DB 컬럼 기준은 최신순 `date`, 조회순 `views`, 좋아요순 `like_count`, 댓글순 `comment_count`입니다.
- 로컬 fallback 정렬도 동일한 컬럼 의미를 따릅니다.
- 좋아요/댓글 추가 및 삭제 시 `posts`, `guest_posts`의 `like_count`, `comment_count`가 자동 갱신됩니다.

## 1. 개요
 - `app/components/UserAvatar.tsx`: 이름 기반 아바타와 업로드된 프로필 사진 표시
 - `app/profile/[id]/AvatarUpload.tsx`: 프로필 아바타 업로드 버튼과 이미지 업로드 처리
- Frontend: Next.js 16.2.1 App Router, React 19.2.4
- Styling: Tailwind CSS 4, CSS variables, shadcn/ui
- Backend: Supabase HTTP client pattern

### Owner Settings

 - `lib/owner-settings.ts`: `owner_settings` 테이블의 오너 아바타 URL 조회/저장 로직
 - 오너 프로필 아바타는 `owner_settings.key = 'avatar_url'` 값을 사용합니다.

기본 방향은 Server Component 우선 구조입니다. 상태, 이벤트 핸들러, 브라우저 API가 필요한 UI만 Client Component로 분리합니다.

 - `lib/env.ts`: 환경 변수 중앙화. `NODE_ENV`, `IS_VERCEL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_FRIENDS_TABLE`, `SUPABASE_OWNER_SETTINGS_TABLE`, `SUPABASE_AVATARS_BUCKET` 포함
 - `lib/supabase/http.ts`: Supabase REST 공통 요청. try/catch 기반 에러 처리 포함
- `/`: 홈, 최신 글 목록
- `/posts`: 블로그 목록
- `/posts/[id]`: 블로그 상세, 댓글, 대댓글, 이모지 반응
- `/posts/new`: 블로그 작성
- `/posts/[id]/edit`: 블로그 수정
- `/guest`: 게스트 게시판 목록
- `/guest/[id]`: 게스트 게시글 상세, 댓글, 대댓글, 이모지 반응
- `/auth/login`: 로그인
- `/auth/signup`: 이메일 OTP 기반 회원가입
- `/admin/members`: Owner 전용 회원 관리

서버 동작은 App Router와 Server Actions로 처리하며, 이동은 `redirect`, 화면 동기화는 `revalidatePath`를 사용합니다.

Next.js 16 기준으로 `middleware.ts`를 사용하지 않고 루트의 `proxy.ts`를 사용합니다.

`proxy.ts`는 `sjc-session` 자체 세션 쿠키를 확인합니다. 세션 쿠키가 없으면 아래 보호 라우트 접근 시 `/auth/login`으로 리다이렉트합니다.

- `/posts/new`
- `/guest/new`
- `/guest/account`
- `/friends`
- `/chat/:path*`
- `/admin/:path*`

`export const config`의 matcher 설정으로 보호 라우트를 제한합니다.

---

## 4. 주요 모듈

### Layout/UI

- `app/layout.tsx`: 루트 레이아웃, Next font, 전역 메타데이터
- `app/components/ClientLayout.tsx`: 클라이언트 전용 전역 UI wrapper
- `app/components/Header.tsx`: 내비게이션
- `app/components/PostsMenu.tsx`: "게시글" 드롭다운 메뉴. 블로그와 게스트 게시판 링크 제공
- `app/components/NavMenuMobile.tsx`: 모바일 내비게이션. 프로필 링크와 친구 링크 포함
- `app/components/ScrollReveal.tsx`: Intersection Observer API 기반 스크롤 등장 애니메이션
- `app/components/ThemeProvider.tsx`, `ThemeToggle.tsx`: 테마 전환
- `app/components/BgmPlayer.tsx`: BGM 플레이어
- `app/components/LiveClock.tsx`: 라이브 시계
- `app/components/UserAvatar.tsx`: 이름 기반 기본 아바타와 업로드된 프로필 사진 표시
- `app/profile/[id]/AvatarUpload.tsx`: 프로필 아바타 업로드 버튼과 이미지 업로드 처리
- `components/ui/*`: shadcn/ui 기반 UI 컴포넌트

### Posts

- `lib/posts.ts`: 블로그 게시글, 댓글, 대댓글, 반응 저장소 로직
- `app/posts/actions.ts`: 블로그 Server Actions
- `app/components/PostsSearchContent.tsx`: 블로그 검색 UI
- `components/post-reaction.tsx`: 게시글 반응 UI
- `components/comment-thread.tsx`: 댓글/대댓글/댓글 반응 UI

### Guest

- `lib/guest-posts.ts`: 게스트 게시글, 댓글, 대댓글, 반응 저장소 로직
- `app/guest/actions.ts`: 게스트 게시판 Server Actions
- `app/components/GuestPostsSearchList.tsx`: 게스트 게시글 검색 UI

### Owner Settings

- `lib/owner-settings.ts`: `owner_settings` 테이블의 오너 아바타 URL 조회/저장 로직
- `owner_settings` 테이블은 `key = 'avatar_url'` 값을 사용해 오너 프로필 아바타 URL을 저장합니다.

### Profile

- `app/profile/[id]/page.tsx`: 공개 프로필 페이지
- owner 프로필은 블로그 게시글 목록을 표시합니다.
- member 프로필은 게스트 게시글 목록을 표시합니다.
- 진입 경로는 nav 아바타, 게시글 작성자 링크, 댓글 작성자 링크입니다.
- 프로필 페이지에서 친구 요청, 수락, 거절, 삭제 버튼을 제공합니다.

### Friends

- `lib/friends.ts`: 친구 요청 생성, 조회, 수락, 거절, 삭제 저장소 로직
- `app/friends/actions.ts`: 친구 기능 Server Actions
- `app/friends/page.tsx`: 사용자 이름 검색, 받은 친구 요청 처리, 친구 목록 관리 페이지
- `app/friends/FriendChatButton.tsx`: 친구 목록에서 채팅방 생성 후 `/chat/[roomId]`로 이동하는 Client Component
- 친구 검색은 owner 계정을 포함합니다.
- 친구 기능은 `proxy.ts` 보호 라우트와 자체 세션 쿠키 인증을 기준으로 접근을 제한합니다.

### Chat

- `lib/chat.ts`: `ChatRoom`, `Message` 타입과 채팅방/메시지 CRUD 로직
- `app/chat/[roomId]/page.tsx`: 세션 쿠키와 참여자 권한을 확인하고 초기 메시지를 조회하는 Server Component
- `app/chat/[roomId]/ChatWindow.tsx`: 메시지 목록, 전송 폼, Supabase Realtime `messages` INSERT 구독을 담당하는 Client Component
- `app/chat/[roomId]/actions.ts`: 메시지 전송 Server Action
- `app/friends/actions.ts`의 `getChatRoomAction()`: 현재 사용자와 친구 사이의 채팅방을 조회하거나 생성
- 채팅 접근은 `proxy.ts`의 `/chat/:path*` 보호 라우트와 서버 사이드 참여자 검증으로 제한합니다.

### Auth

- `lib/auth/core.ts`: 회원 저장소, 회원 정규화, 공통 인증 로직
- `lib/auth/login.ts`: 로그인 및 Owner 비밀번호 해시 비교
- `lib/auth/signup.ts`: 이메일 OTP 기반 회원가입
- `lib/auth/session.ts`: 자체 세션 서명/쿠키 처리
- `lib/auth/account.ts`: 프로필 수정, 비밀번호 변경, 회원 탈퇴
- `lib/auth/admin.ts`: Owner용 회원 조회
- `app/auth/actions.ts`: 인증 Server Actions
- `proxy.ts`: 보호 라우트 세션 쿠키 확인 및 로그인 리다이렉트

### Shared Utilities

- `lib/env.ts`: 환경 변수 중앙화. `NODE_ENV`, `IS_VERCEL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_FRIENDS_TABLE`, `SUPABASE_OWNER_SETTINGS_TABLE`, `SUPABASE_AVATARS_BUCKET` 포함
- `lib/storage.ts`: Supabase Storage, Vercel Blob, local file fallback
- `lib/supabase/http.ts`: Supabase REST 공통 요청. try/catch 기반 에러 처리 포함
- `lib/supabase/client.ts`: Supabase client 생성
- `lib/permissions.ts`: 게시글/댓글 관리 권한
- `lib/date.ts`: KST 날짜/시간
- `lib/form-utils.ts`: FormData 문자열/숫자 처리
- `lib/attachment-utils.ts`: 링크/첨부 정규화
- `lib/avatar-utils.ts`: 이름 기반 아바타 색상/문자 생성
- `lib/safe-json.ts`: 안전한 JSON 파싱

---

## 5. 데이터 흐름

1. 사용자가 폼 제출 또는 반응 버튼 클릭
2. 보호 라우트는 `proxy.ts`에서 자체 세션 쿠키를 먼저 확인
3. Server Action에서 세션, 권한, 입력값 검증
4. `lib/posts.ts`, `lib/guest-posts.ts`, `lib/friends.ts`, `lib/chat.ts`, `lib/auth/*` 저장소 함수 호출
5. Supabase 사용 가능 시 Supabase HTTP/Storage 요청
6. Supabase 또는 Blob 설정이 부족한 환경에서는 기존 local fallback 흐름 사용
7. 변경 성공 후 `revalidatePath`와 `redirect`로 화면 갱신

권한 검증은 자체 세션 쿠키 인증을 기준으로 Server Action에서 수행합니다. Supabase Auth를 사용하지 않으므로 Supabase RLS의 `auth.uid()`는 자체 세션 사용자를 알 수 없고 null을 반환합니다. 따라서 쓰기 권한은 `lib/permissions.ts`, `app/posts/actions.ts`, `app/guest/actions.ts`, `proxy.ts` 조합으로 검증합니다.

채팅 Realtime 구독은 브라우저에서 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용해 생성한 Supabase 클라이언트로 수행합니다. 오너 아바타는 `owner_settings` 테이블에서, 회원 아바타는 `members.avatar_url`에서 읽습니다.

---

## 6. 데이터 모델

### members

- `id` (PK)
- `name`
- `password`
- `email`
- `email_verified`
- `avatar_url`
- `created_at`

회원 인증은 Supabase Auth가 아니라 자체 세션 쿠키와 이메일 OTP 흐름을 기준으로 합니다. Owner 계정은 `OWNER_PASSWORD` 해시값과 입력 비밀번호의 SHA-256 해시를 비교합니다.

### owner_settings

- `id` (PK)
- `key`
- `value`
- `created_at`
- `updated_at`

owner_settings 테이블은 오너 전용 설정을 저장합니다. 현재는 `key = 'avatar_url'` 값으로 오너 프로필 아바타 URL을 저장합니다.

### posts

- `id` (PK)
- `title`
- `content`
- `author`
- `author_id`
- `category`
- `date`
- `link_url`
- `file_url`
- `file_name`
- `views`

posts 테이블은 Ch11에서 RLS를 활성화했습니다. 당시 적용 정책은 `posts_select_public`(SELECT 누구나 가능), `posts_insert_authenticated`(INSERT 로그인 사용자만 가능, `author_id = auth.uid()`), `posts_update_owner`(UPDATE 작성자만 가능), `posts_delete_owner`(DELETE 작성자만 가능)입니다.

Ch13 이후 posts 쓰기 정책은 자체 세션 쿠키 인증 구조에 맞춰 변경되었습니다. Supabase Auth를 사용하지 않아 `auth.uid()`가 null을 반환하므로 INSERT/UPDATE/DELETE는 service_role 기반 정책으로 열고, 실제 권한은 Server Action에서 검증합니다. SELECT 공개 정책은 유지합니다.

- `posts_insert_service`: INSERT는 서버 사이드 권한 검증 후 service_role 요청으로 허용
- `posts_update_service`: UPDATE는 서버 사이드 권한 검증 후 service_role 요청으로 허용
- `posts_delete_service`: DELETE는 서버 사이드 권한 검증 후 service_role 요청으로 허용
- `posts_category_valid`: `study`, `daily`, `info`, `notice` 허용

### guest_posts

- `id` (PK)
- `title`
- `content`
- `author_id`
- `author_name`
- `category`
- `date`
- `link_url`
- `file_url`
- `file_name`
- `views`
- `comments` (legacy 호환용 JSONB)

guest_posts 테이블은 Ch13 이후 RLS를 비활성화했습니다. 자체 세션 쿠키 기반 권한은 `app/guest/actions.ts`와 `lib/permissions.ts`에서 서버 사이드로 검증합니다.

### post_comments

- `id` (PK)
- `post_id`
- `author_id`
- `author_name`
- `content`
- `date_time`
- `parent_id`

`parent_id`가 없으면 최상위 댓글이고, 값이 있으면 해당 댓글의 대댓글입니다.

### guest_post_comments

- `id` (PK)
- `guest_post_id`
- `author_id`
- `author_name`
- `content`
- `created_at`
- `parent_id`

`parent_id` 구조는 블로그 댓글과 동일합니다.

### reactions

- `post_reactions`
- `post_comment_reactions`
- `guest_post_reactions`
- `guest_comment_reactions`

각 반응 테이블은 대상 id, `member_id`, `emoji`, 생성 시각을 저장합니다.

### friends

- `id` (PK)
- `requester_id`
- `requester_name`
- `receiver_id`
- `receiver_name`
- `status`
- `created_at`
- `updated_at`

friends 테이블은 친구 요청과 친구 관계를 저장합니다. `status`는 요청 대기, 수락 등 관계 상태를 표현하며, RLS 정책은 로그인 사용자 본인이 요청자 또는 수신자인 친구 레코드만 생성/조회/변경/삭제할 수 있도록 제한합니다.

### chat_rooms

- `id` (PK)
- `user_a_id`
- `user_b_id`
- `created_at`

chat_rooms 테이블은 1:1 채팅방을 저장합니다. `user_a_id < user_b_id` 체크 제약으로 사용자 쌍 정렬을 보장하고, `(user_a_id, user_b_id)` 유니크 제약으로 같은 사용자 쌍의 중복 방 생성을 막습니다.

### messages

- `id` (PK)
- `room_id`
- `sender_id`
- `content`
- `image_url`
- `is_read`
- `created_at`

messages 테이블은 채팅 메시지를 저장합니다. `room_id`는 `chat_rooms(id)`를 참조하고 채팅방 삭제 시 함께 삭제됩니다. `image_url`은 채팅 이미지 첨부를 저장하고, `is_read`는 상대방이 메시지를 읽었는지 나타내는 boolean 값입니다.

`messages` 테이블은 Supabase Realtime publication에 등록되어 Client Component에서 INSERT/UPDATE 이벤트를 구독합니다. `ChatPanel`은 내가 보낸 메시지 중 `is_read = false`인 항목에 카카오톡 스타일 `1`을 표시하고, UPDATE 이벤트로 `is_read`가 true가 되면 표시를 제거합니다. Realtime 누락을 보정하기 위해 채팅창 열림, 브라우저 탭 포커스 복귀, 플로팅 전환 시 `getMessageReadStatusesAction()`으로 서버의 최신 `id/is_read` 상태만 다시 동기화합니다.

chat_rooms/messages 테이블은 자체 세션 쿠키 기반 서버 사이드 권한 검증을 사용하므로 RLS를 비활성화했습니다. 참여자 검증은 `lib/chat.ts`의 `isChatRoomParticipant()`와 채팅 Server Action/페이지에서 수행합니다.

### avatars

- Supabase Storage `avatars` 버킷은 프로필 아바타 이미지 업로드에 사용합니다.
- 프로필 아바타는 이름 기반 기본 아바타를 우선 표시하고, 업로드된 이미지가 있으면 해당 이미지를 표시합니다.

---

## 7. 저장 전략

- 게시글/댓글/반응: Supabase REST 우선, local JSON fallback 유지
- 첨부 파일: Supabase Storage 우선, Vercel Blob 또는 local fallback
- 회원: 자체 회원 저장소와 세션 쿠키 흐름 유지
- 친구: Supabase REST 우선, 자체 세션 쿠키와 RLS 기반 권한 강제
- 채팅: Supabase REST 우선, 자체 세션 쿠키와 서버 사이드 참여자 권한 검증, Realtime INSERT/UPDATE 구독 및 읽음 상태 서버 동기화
- 환경 변수: `lib/env.ts`에서 중앙 관리

---

## 8. 권한 모델

- Owner: 블로그/게스트 게시글과 댓글 관리 가능, 회원 관리 페이지 접근 가능
- Member: 본인이 작성한 게스트 게시글과 댓글 관리 가능
- 비회원: 공개 목록/상세 조회 중심, 보호 라우트 접근 시 `/auth/login`으로 이동
- 게시글/댓글 관리 권한은 `lib/permissions.ts`에서 공통 처리
- 친구 관계 관리는 `lib/friends.ts`와 friends 테이블 RLS 정책으로 요청자/수신자 기준 권한을 강제
- 채팅방 접근과 메시지 전송은 `lib/chat.ts`, `app/chat/[roomId]/page.tsx`, `app/chat/[roomId]/actions.ts`에서 참여자 기준으로 검증
- UI 분기는 작성자에게만 수정/삭제 버튼을 보여 주는 UX 계층입니다.
- DB 보안은 클라이언트 조건문이 아니라 Supabase RLS로 강제합니다.
- 이 프로젝트는 Supabase Auth를 사용하지 않고 자체 세션 쿠키를 사용하므로 Supabase RLS의 `auth.uid()` 기반 쓰기 정책은 자체 로그인 사용자와 연결되지 않습니다.
- Ch13 이후 블로그/게스트 쓰기 권한은 다음 서버 사이드 계층에서 검증합니다.
  - `lib/permissions.ts`: 권한 체크 공통 함수
  - `app/posts/actions.ts`: 블로그 Server Action 세션/권한 검증
  - `app/guest/actions.ts`: 게스트 게시판 Server Action 세션/권한 검증
  - `proxy.ts`: 보호 라우트 차단
- posts 테이블 보호 정책:
  - `posts_select_public`: SELECT 누구나 가능
  - INSERT/UPDATE/DELETE: service_role 기반 정책으로 허용하고 Server Action에서 권한 검증
- guest_posts 테이블 보호 정책:
  - RLS 비활성화
  - Server Action에서 세션/권한 검증

---

## 9. 구현 완료 기능

- 블로그 게시글 CRUD
- `/posts` 목록 Supabase 또는 local fallback 연결
- `/posts/[id]` 상세 연결
- `/posts/new` 작성 연결
- 작성자에게만 수정/삭제 UI 표시
- 게스트 게시글 CRUD
- 댓글 CRUD
- `parent_id` 기반 대댓글
- 게시글/댓글 이모지 반응
- 자체 세션 쿠키 기반 로그인
- 이메일 OTP 흐름
- `proxy.ts` 보호 라우트
- 비로그인 사용자 `/auth/login` 리다이렉트
- 회원 프로필 수정
- 회원 비밀번호 변경
- 회원 탈퇴
- Owner 회원 관리
- 공개 프로필 페이지 `/profile/[id]`
- 친구 기능
- `/friends` 친구 검색/요청 관리/친구 목록 페이지
- `/profile/[id]` 친구 요청/수락/거절/삭제 버튼
- `lib/friends.ts` 친구 CRUD 함수
- `app/friends/actions.ts` 친구 Server Actions
- `NavMenuMobile.tsx` 친구 링크
- `proxy.ts` `/friends` 보호 라우트
- friends 테이블 RLS 활성화
- `supabase/migrations/20260521055613_add_friends_table.sql` 마이그레이션 작성
- `lib/env.ts` `SUPABASE_FRIENDS_TABLE` 상수 추가
- 라이브 채팅 기능
- `lib/chat.ts` 채팅 CRUD 함수와 타입 추가
- `/chat/[roomId]` 채팅 페이지 추가
- `app/chat/[roomId]/ChatWindow.tsx` Supabase Realtime 구독 추가
- `app/chat/[roomId]/actions.ts` 메시지 전송 Server Action 추가
- `app/friends/FriendChatButton.tsx` 친구 목록 채팅 버튼 추가
- `app/friends/actions.ts` `getChatRoomAction()` 추가
- `PostsMenu.tsx`, `NavMenuMobile.tsx` 채팅 진입 링크 추가
- `proxy.ts` `/chat/:path*` 보호 라우트 추가
- chat_rooms/messages 테이블 생성 및 `messages` Realtime 등록
- `supabase/migrations/20260529004057_add_chat_tables.sql` 마이그레이션 작성
- Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` Realtime 환경 변수 추가
- 검색
- 파일/링크 첨부
- 테마 전환
- 이름 기반 아바타
- 게시글 목록 스크롤 애니메이션
- 간결화된 내비게이션과 `PostsMenu.tsx`
- `.agent/rules/project.md` 생성
- Next.js 16 기준 `middleware.ts` 제거 및 `proxy.ts` 전환
- 환경 변수 중앙화와 CSS variables 규칙 위반 수정
- posts 테이블 RLS 활성화
- `posts_select_public`, `posts_insert_authenticated`, `posts_update_owner`, `posts_delete_owner` 정책 적용
- `supabase/migrations/20260520041504_add_posts_rls.sql` 마이그레이션 작성 및 `npx supabase db push` 원격 적용 완료
- posts RLS INSERT/UPDATE/DELETE 정책을 auth.uid() 기반에서 service_role 기반으로 수정
- `supabase/migrations/20260526164049_fix_posts_rls.sql` 마이그레이션 작성
- posts_category_valid 제약 조건에 `notice` 카테고리 추가
- `supabase/migrations/20260526170435_fix_posts_category_constraint.sql` 마이그레이션 작성
- `lib/posts.ts` 레거시 카테고리 체크 코드 제거
- `lib/guest-posts.ts` 레거시 카테고리 체크 코드 제거
- guest_posts RLS 비활성화
- `supabase/migrations/20260526173544_disable_guest_posts_rls.sql` 마이그레이션 작성
- Playwright E2E 테스트 2개 통과
- 보안 grep 3개 통과
- Vercel 수동 검증 5개 완료
- Ch13 검증 보고서 작성: `docs/verification-report.md`
- 브라우저 우회 테스트로 다른 계정의 수정/삭제 실패 확인
- 민감 키 grep 검사 통과
- 클라이언트 컴포넌트에서 service_role 키 미사용 확인
- `npm run build` 통과
- GitHub push 완료
- Vercel Production 배포 완료

---

## 10. 미구현 기능

- 팔로우 기능
- Supabase Realtime 기반 알림
- 업로드형 프로필 이미지
- E2E 테스트 CI 자동화
- 반응 테이블을 포함한 Supabase SQL 문서 최신화

---

## 11. 설계 원칙

- App Router만 사용
- Server Component 우선
- Server Action 흐름 유지
- 환경 변수는 `lib/env.ts` 기준
- Supabase HTTP 요청은 `lib/supabase/http.ts` 패턴 사용
- 인증은 자체 세션 쿠키 + 이메일 OTP 구조 유지
- Next.js 16 기준 `proxy.ts` 사용
- 입력값과 권한 검증 제거 금지
- Tailwind 기본 색상 직접 사용 지양, CSS variables 우선

---

## 12. 최신 반영 사항

### 모바일 최적화 및 UI/UX

- 첨부파일 UI 하단 잘림을 수정했습니다.
- 회원정보 나가기 버튼은 홈으로 이동하도록 정리했습니다.
- 햄버거 메뉴의 친구/채팅 진입을 통합하고 내 프로필 텍스트를 정리했습니다.
- 테마/언어 설정 토글 스타일을 개선했습니다.
- BGM 정지 후 클릭 재생 버그를 수정했습니다.
- 모바일 뮤직 플레이어와 최소화 탭을 중앙 정렬했습니다.
- 모바일 footer 하단 여백, 모바일 최소화 탭 간격, 모바일 nav 제목 중앙 정렬을 조정했습니다.
- 모바일 버튼 텍스트 줄바꿈을 방지했습니다.
- 채팅창 카드 둥근 모서리와 footer 겹침 방지 스타일을 정리했습니다.

### 채팅 개선

- `app/components/ChatPanel.tsx`는 Enter 키 전송, 새 메시지 수신 시 자동 스크롤, 상대방 이름/아바타 표시, 채팅 사진 전송을 담당합니다.
- `app/components/GlobalChatWindow.tsx`는 데스크탑/모바일 플로팅 채팅과 최소화 탭을 담당합니다.
- `lib/context/ChatContext`는 전역 채팅방 상태를 관리합니다.
- `lib/context/PlayerContext`는 뮤직 플레이어 최소화 상태를 공유해 채팅 플로팅 위치와 연동합니다.
- 메시지 아바타는 1분 기준으로 그룹핑됩니다.
- `messages.image_url` 컬럼과 Supabase Storage `chat-images` 버킷을 사용해 채팅 사진을 저장합니다.
- 관련 마이그레이션: `supabase/migrations/20260530190901_add_image_url_to_messages.sql`

### 알림

- `notifications` 테이블을 추가하고 RLS를 비활성화했습니다.
- `notifications` 테이블은 Supabase Realtime publication에 등록되어 nav 알림 드롭다운에서 INSERT 이벤트를 구독합니다.
- `lib/notifications.ts`는 알림 생성, 최근 알림 조회, 안읽음 개수 조회, 단일/전체 읽음 처리를 담당합니다.
- `app/components/NotificationBell.tsx`는 nav 알림 아이콘, 안읽음 뱃지, 드롭다운 UI, Realtime 구독을 담당합니다.
- `app/components/notification-actions.ts`는 알림 스냅샷 조회와 읽음 처리 Server Actions를 제공합니다.
- 친구 요청, 블로그/게스트 댓글, 채팅 메시지 전송 시 알림을 생성합니다.
- 알림 UI는 티파니 블루 CSS variables `--color-accent`, `--color-accent-subtle`을 사용합니다.
- 관련 마이그레이션: `supabase/migrations/20260530205656_add_notifications_table.sql`

### 게시글 이미지 첨부

- `posts`, `guest_posts`에 `image_url` 컬럼을 추가했습니다.
- 블로그/게스트 게시글 작성 및 수정 시 이미지를 업로드할 수 있습니다.
- 게시글 상세 본문에 업로드 이미지를 표시합니다.
- Supabase Storage `post-images` 버킷을 사용합니다.
- 관련 마이그레이션: `supabase/migrations/20260530000000_add_image_url_to_posts.sql`

### E2E CI

- `.github/workflows/e2e.yml`을 추가했습니다.
- GitHub Actions push 시 Playwright E2E 테스트를 자동 실행합니다.
- GitHub Repository Variable `PLAYWRIGHT_BASE_URL`을 테스트 대상 URL로 사용합니다.

### 환경 변수

- `SUPABASE_CHAT_IMAGES_BUCKET` (default: `chat-images`)
- `SUPABASE_POST_IMAGES_BUCKET` (default: `post-images`)
- `SUPABASE_NOTIFICATIONS_TABLE` (default: `notifications`)

### 미구현 목록 정정

- `Supabase Realtime 기반 알림`과 `E2E 테스트 CI 자동화`는 완료되었습니다.
- `업로드형 프로필 이미지`는 owner/member 아바타 업로드 흐름으로 1차 완료되었으며, 추가 확장 여부만 검토 대상입니다.
---

## 13. 2026-06-04 최신 반영

### Layout/UI

- `app/components/BackButton.tsx`가 추가되었습니다.
- `BackButton`은 Client Component이며 `usePathname()`으로 홈(`/`) 여부를 판단합니다.
- 홈에서는 렌더링하지 않고, 홈을 제외한 페이지에서는 `useRouter().back()`으로 이전 페이지 이동을 수행합니다.
- `Header.tsx`는 모바일과 데스크탑 모두 사이트 타이틀 왼쪽에 `BackButton`을 배치합니다.

### 첨부 파일

- `lib/attachment-utils.ts`의 허용 MIME 타입에 `text/html`을 추가해 HTML 파일 업로드를 허용합니다.

### 채팅 전체모드 하단 여백

- `app/chat/[roomId]/page.tsx`의 채팅 전체모드 section 하단 여백은 기기별로 관리합니다.
- 기본(no prefix, 모바일 768px 미만): `bottom-14`
- `md`, `lg`, `xl`: `bottom-[165px]`
- `2xl` 이상: `bottom-28`
- 아이패드 11인치 1180px는 Tailwind `lg` 구간이므로 footer와 뮤직 플레이어 겹침을 피하기 위해 `lg:bottom-[165px]`를 유지합니다.

### Tailwind breakpoint 기준

- 기본(no prefix): 모바일, 768px 미만
- `md`: 768px 이상, 태블릿 포함
- `lg`: 1024px 이상
- `xl`: 1280px 이상
- `2xl`: 1536px 이상, 대형 데스크탑

### YouTube 영상 임베드

- `posts`, `guest_posts` 테이블은 YouTube 영상 URL 저장을 위해 `youtube_url` 컬럼을 사용합니다.
- 컬럼 추가 마이그레이션은 `supabase/migrations/20260604000000_add_youtube_url_to_posts.sql`입니다.
- `lib/posts.ts`, `lib/guest-posts.ts`는 `youtubeUrl` 타입 필드를 Supabase REST row의 `youtube_url`과 매핑합니다.
- 생성/수정 Server Action은 `app/posts/actions.ts`, `app/guest/actions.ts`에서 `FormData`의 `youtubeUrl`을 읽어 저장소 함수로 전달합니다.
- 작성 폼은 `app/components/PostNewForm.tsx`, `app/components/GuestNewForm.tsx`에서 YouTube URL 입력 필드를 제공합니다.
- `/posts/new`, `/guest/new`, `/posts/[id]/edit`, `/guest/[id]/edit`는 YouTube URL 라벨과 기존 값 초기화를 담당합니다.
- `/posts/[id]`, `/guest/[id]` 상세 페이지는 유효한 YouTube URL이 있을 때 16:9 iframe으로 영상을 렌더링합니다.
- URL 정규화, YouTube 도메인 검증, 영상 ID 추출, embed URL 생성은 `lib/attachment-utils.ts`에서 담당합니다.
- 지원 URL 형식은 `watch?v=VIDEO_ID`, `youtu.be/VIDEO_ID`입니다.

### 채팅 메시지 읽음 표시

- `messages` 테이블은 읽음 표시를 위해 `is_read boolean not null default false` 컬럼을 사용합니다.
- 컬럼 추가 마이그레이션은 `supabase/migrations/20260604000001_add_is_read_to_messages.sql`입니다.
- `lib/chat.ts`는 `Message.is_read`, 메시지 조회/전송 시 `is_read` select, `markMessagesAsRead()`, `getMessageReadStatuses()`를 지원합니다.
- `app/chat/[roomId]/actions.ts`는 `markMessagesAsReadAction()`과 `getMessageReadStatusesAction()`에서 세션 및 채팅방 참여자 검증 후 읽음 상태를 처리합니다.
- `app/components/ChatPanel.tsx`는 내가 보낸 미확인 메시지 옆에 카카오톡 스타일 `1`을 표시하고, Realtime UPDATE 또는 서버 동기화 결과로 `is_read`가 true가 되면 표시를 제거합니다.
- `app/components/GlobalChatWindow.tsx`는 플로팅 채팅에서도 새 메시지와 읽음 상태가 유지되도록 `ChatPanel`에 추가 메시지와 읽음 동기화 신호를 전달합니다.
- Realtime 누락 보정을 위해 채팅창 열림, 브라우저 탭 포커스 복귀, 최소화에서 플로팅 전환 시 서버의 최신 `id/is_read` 상태를 다시 동기화합니다.
