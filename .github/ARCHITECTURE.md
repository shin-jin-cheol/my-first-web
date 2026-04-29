# Architecture

## Overview

이 프로젝트는 개인 블로그 + 커뮤니티 기능을 포함한 웹 서비스이다.

* Frontend: Next.js
* Backend: Supabase
* Deployment: Vercel

---

## Pages

* `/` : 메인 (게시글 목록)
* `/post/[id]` : 게시글 상세
* `/write` : 글 작성
* `/profile` : 사용자 프로필
* `/chat` : 실시간 채팅

---

## Component Structure

### Layout

* Navbar
* Sidebar
* Footer

### Post

* PostCard
* PostDetail
* PostEditor

### Comment

* CommentList
* CommentItem
* CommentForm

### Chat

* ChatRoom
* ChatMessage
* ChatInput

---

## Data Flow

1. 사용자가 글 작성
2. Frontend → Supabase API 요청
3. DB 저장
4. 결과 반환 후 UI 업데이트

---

## Data Models

### posts

* id (PK)
* title
* content
* author
* author_id
* category
* file_url
* link_url
* created_at

### comments (planned)

* id
* post_id
* user_id
* content
* parent_id (대댓글)

### users

* id
* username
* avatar_url

### friends (planned)

* id
* user_id
* friend_id

---

## Realtime

* Supabase Realtime 사용
* 채팅 및 알림 처리

---

## Design Principles

* 단순하게 시작 → 점진적 확장
* 프론트 중심 구조
* 서버 로직 최소화
