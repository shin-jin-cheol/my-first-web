# Context — my-first-web 프로젝트 상태

## 현재 상태 (요약)

- 프로젝트는 App Router 기반으로 서버 우선(Server Components) 패턴을 따릅니다.
- 인증 및 일부 데이터는 Supabase와 연동되며, 레거시로 JSON 파일과 Vercel Blob를 보조 저장소로 사용합니다.
- 최근 리팩토링(Phase 1~4)은 권한 공용화, 안전한 JSON 파싱, 환경 변수 중앙화, 일부 문서 정리 등을 포함합니다.

## 기술 결정(현재)

- Next.js 16 App Router, Server Actions 중심
- React 19 (필수 클라이언트 컴포넌트만 `"use client"` 사용)
- Tailwind CSS 4 + CSS 변수 기반 디자인 토큰
- shadcn/ui 우선 사용
- Supabase (선택적), Vercel Blob, 로컬 JSON 파일 보조

## 주의 사항

- 일부 문서(예: .github/ARCHITECTURE.md)는 이전 Pages Router 기반의 설명이 포함되어 있었으나 현재 App Router 구조로 갱신되었습니다.
- 런타임 동작은 변경하지 않았으나, 로컬/레거시 경로에는 아직 직접적인 JSON.parse나 env 접근이 남아 있어 안전 처리 및 중앙화가 일부 파일에 적용되었습니다.