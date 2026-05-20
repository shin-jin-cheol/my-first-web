# TODO

## 완료

### Core

- [x] 블로그 게시글 CRUD
- [x] 게스트 게시글 CRUD
- [x] 카테고리 시스템
- [x] 검색 기능
- [x] 파일 첨부
- [x] 링크 첨부
- [x] Ch10 게시글 CRUD 완료
- [x] `/posts` 목록 Supabase 또는 local fallback 연결
- [x] `/posts/[id]` 상세 연결
- [x] `/posts/new` 작성 연결
- [x] 작성자에게만 수정/삭제 UI 표시
- [x] Ch11 posts 테이블 RLS 활성화
- [x] `posts_select_public` SELECT 누구나 가능 정책 적용
- [x] `posts_insert_authenticated` INSERT 로그인 사용자 및 `author_id = auth.uid()` 정책 적용
- [x] `posts_update_owner` UPDATE 작성자만 가능 정책 적용
- [x] `posts_delete_owner` DELETE 작성자만 가능 정책 적용

### 댓글/반응

- [x] 블로그 댓글 CRUD
- [x] 게스트 댓글 CRUD
- [x] 대댓글 기능
- [x] 게시글 이모지 반응
- [x] 댓글 이모지 반응
- [x] 이름 기반 댓글 아바타

### 인증/회원

- [x] 자체 세션 쿠키 기반 로그인
- [x] 이메일 OTP 기반 회원가입/로그인 흐름
- [x] 세션 쿠키 서명
- [x] 회원 프로필 수정
- [x] 회원 비밀번호 변경
- [x] 회원 탈퇴
- [x] Owner 전용 회원 관리
- [x] Owner 비밀번호 해시 비교
- [x] `proxy.ts` 보호 라우트 추가
- [x] 비로그인 사용자 `/auth/login` 리다이렉트

### UI/UX

- [x] 다크/라이트 시스템 테마
- [x] 반응 UI 레이아웃
- [x] 모바일 내비게이션
- [x] 다국어 텍스트 처리
- [x] BGM 플레이어
- [x] 라이브 시계
- [x] 스크롤 애니메이션 (`ScrollReveal`)
- [x] 네비게이션 바 간결화
- [x] `PostsMenu.tsx` 게시글 드롭다운
- [x] 글쓰기 버튼 텍스트 "새 글 쓰기" 통일

### 프로필

- [x] 프로필 페이지 (`/profile/[id]`)
- [x] owner 프로필 블로그 게시글 목록 표시
- [x] member 프로필 게스트 게시글 목록 표시
- [x] nav 아바타, 게시글 작성자, 댓글 작성자 프로필 링크
- [x] `NavMenuMobile` 프로필 링크 추가

### 안정화/구조

- [x] 환경 변수 중앙화
- [x] Supabase HTTP 요청 공통화
- [x] Supabase Storage/Blob/local fallback 저장 전략
- [x] 안전한 JSON 파싱
- [x] 권한 체크 공통화
- [x] KST 날짜 유틸
- [x] FormData 유틸
- [x] Next.js 16 기준 `middleware.ts` 제거 및 `proxy.ts` 전환
- [x] `.agent/rules/project.md` 생성
- [x] 규칙 위반 코드 수정 (env 중앙화, CSS variables)
- [x] `lib/env.ts`에 `NODE_ENV`, `IS_VERCEL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
- [x] `lib/auth/session.ts`, `lib/storage.ts`, `lib/supabase/client.ts`, `app/layout.tsx` env 중앙화
- [x] `components/comment-thread.tsx` `text-white`를 `text-[var(--surface)]`로 수정
- [x] `supabase/migrations/20260520041504_add_posts_rls.sql` 마이그레이션 작성
- [x] `npx supabase db push` 원격 적용 완료

### 검증/배포

- [x] `npm run build` 통과
- [x] `npm run lint` 통과
- [x] 브라우저 우회 테스트 완료 (다른 계정 수정/삭제 실패 확인)
- [x] 민감 키 grep 검사 통과
- [x] 클라이언트 컴포넌트에서 service_role 키 미사용 확인
- [x] GitHub push 완료
- [x] Vercel 배포 완료

---

## 미구현/보류

- [ ] 실시간 채팅
- [ ] 친구/팔로우 기능
- [ ] Supabase Realtime 알림
- [ ] 업로드형 프로필 이미지
- [ ] E2E 테스트
- [ ] 반응 테이블 포함 Supabase SQL 문서 최신화
