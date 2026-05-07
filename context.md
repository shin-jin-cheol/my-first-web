# Context

## Project Overview

개인 공부 + 일상 블로그
커뮤니티 기능 확장 예정 (댓글, 채팅, 친구)

---

## Tech Stack

* Frontend: Next.js
* Backend: Supabase
* Deployment: Vercel

---

## Current Features

* 게시글 CRUD
* 카테고리 시스템
* 파일 업로드

---

## Planned Features

* 댓글 / 대댓글
* 좋아요 / 이모지 반응
* 실시간 채팅
* 친구 기능
* 프로필 페이지

---

## Database

### posts

* id
* title
* content
* author
* author_id
* category
* file_url
* link_url

---

## Rules

* 모든 입력값 공백 금지
* category 제한
* async/await 사용

---

## Design Principles

* 빠르게 만들고 점진적으로 개선
* Supabase 중심 구조
* 서버 최소화

---

## Open Questions

* 대댓글 depth 제한 필요?
* 채팅 read 처리 방식
* 친구 기능: 팔로우 vs 상호 친구?
