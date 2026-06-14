# TODO

## 2026-06-14 문서 정리 완료

- [x] `AGENTS.md`, `ARCHITECTURE.md`, `CLAUDE.md`, `context.md`, `todo.md`, `README.md` 확인
- [x] 실제 `app/` 페이지 라우트 목록 확인
- [x] `README.md`를 페이지별 기능 안내 구조로 재구성
- [x] 게스트 게시글 상세의 대댓글 들여쓰기, owner 댓글 아바타, 정렬 정상화 내용을 README에 반영
- [x] 채팅 읽음 표시, Realtime, 플로팅/전체모드 내용을 README에 반영
- [x] 게시글 상세의 YouTube 임베드, 이미지/파일/HTML 첨부 내용을 README에 반영
- [x] 친구 목록 채팅 버튼 정렬 내용을 README에 반영
- [x] 환경변수 목록과 로컬 실행 방법 섹션 유지
- [x] `AGENTS.md`, `ARCHITECTURE.md`, `context.md`, `CLAUDE.md`에 실제 코드와 맞는 최신 라우트/기능 상태만 보강

## 현재 완료된 주요 기능

- [x] 블로그 게시글 CRUD
- [x] 게스트 게시글 CRUD
- [x] 게시글/게스트 게시글 목록 정렬: 최신순, 조회수순, 좋아요순, 댓글순
- [x] 카테고리 필터와 검색
- [x] 게시글 이미지 첨부와 1200px 기준 리사이징
- [x] 파일, 링크, HTML 파일 첨부
- [x] YouTube URL 저장과 상세 페이지 iframe 임베드
- [x] 댓글, 대댓글, 댓글/게시글 이모지 반응
- [x] 게스트 댓글 `parent_id` 기반 대댓글 들여쓰기
- [x] owner 댓글 프로필 사진 표시
- [x] 자체 `sjc-session` 쿠키 인증
- [x] 이메일 OTP 회원가입
- [x] 보호 라우트 `proxy.ts` 적용
- [x] owner/member 프로필과 아바타 업로드
- [x] 친구 검색, 요청, 수락, 거절, 삭제
- [x] 친구 목록 채팅 버튼과 삭제 버튼 오른쪽 정렬
- [x] 1:1 Supabase Realtime 채팅
- [x] 채팅 이미지 전송
- [x] 채팅 읽음 표시 `1`
- [x] 플로팅 채팅창과 전체모드 채팅
- [x] Realtime 알림
- [x] BGM 플레이어와 모바일 내비게이션 최적화
- [x] Playwright/GitHub Actions E2E workflow 구성

## 유지 관리 체크

- [ ] 새 페이지 라우트가 추가되면 `README.md` 페이지별 기능 안내와 문서의 라우트 목록을 함께 갱신
- [ ] Supabase 스키마나 RLS 정책 변경 시 `supabase/migrations/`와 아키텍처 문서를 함께 갱신
- [ ] 인증/권한 흐름 변경 시 `proxy.ts`, Server Action, `lib/permissions.ts` 기준으로 문서 재검토
