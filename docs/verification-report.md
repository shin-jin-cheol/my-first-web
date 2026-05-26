# Ch13 검증 보고서

## 테스트 환경

- Local: Next.js 16.2.1
- Production: https://my-first-web-ten-phi.vercel.app

## Playwright E2E 테스트 결과

- 테스트 1 (행복 경로 - 로그인 후 글 작성): ✅ 통과
- 테스트 2 (거절 경로 - 비로그인 보호 라우트 차단): ✅ 통과

검증 명령:

```bash
npx playwright test tests/auth-crud.spec.ts
```

결과: 6 passed

## 보안 grep 결과

- 민감 키 grep (service_role 클라이언트 노출): ✅ 없음
- 구버전 라우터/API grep (next/router, auth.signIn): ✅ 없음
- XSS 위험 grep (dangerouslySetInnerHTML, eval): ✅ 없음

## Vercel 배포 수동 검증 결과

- 홈/목록 페이지 접속: ✅ 정상 로드
- 로그인: ✅ 성공
- 글 작성: ✅ 성공
- 로그아웃: ✅ 성공
- 비로그인 /posts/new 접근: ✅ 로그인 페이지로 리다이렉트

## 발견 및 수정한 문제

- posts RLS INSERT 정책이 auth.uid() 기반이라 자체 세션 쿠키와 충돌 → service_role 기반으로 수정
- posts_category_valid 제약 조건에 notice 카테고리 누락 → 추가
- lib/posts.ts 레거시 카테고리 체크 코드 → 제거

## 남은 확인 필요 항목

- E2E 테스트 CI 자동화
- 업로드형 프로필 이미지
- 실시간 채팅
