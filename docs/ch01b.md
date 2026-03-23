# B회차: 실습

> **미션**: 블로그 첫 페이지를 수정하고 인터넷에 배포한다
> 

---

---

## 과제 스펙 + 스타터 코드 안내

### 과제 요구사항

**블로그 첫 페이지**를 만든다:

① `app/page.js`에서 기본 Next.js 템플릿 내용을 삭제한다

② 본인의 이름과 한 줄 자기소개를 표시한다

③ Tailwind CSS 클래스로 텍스트 크기, 정렬, 색상을 조정한다

④ git push하여 Vercel에 자동 배포한다

⑤ 배포된 URL을 제출한다

### 프로젝트 시작

A회차에서 `npx create-next-app@latest`로 만든 프로젝트를 그대로 사용한다.

```bash
cd my-first-web
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 기본 페이지가 보이는지 확인한다.

### 이번 챕터에서 수정할 파일

- `app/page.js` — 기본 Next.js 템플릿 내용을 삭제하고 본인 이름/자기소개로 교체

---

## 바이브코딩 가이드

> Ch1에서는 아직 Copilot을 설정하지 않았다. 이번 실습은 **코드를 직접 수정**하는 방식으로 진행한다. Copilot은 2장에서 설치한다.
> 

**page.js 수정 예시**:

```jsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">홍길동</h1>
      <p className="mt-4 text-xl text-gray-600">웹 프로그래밍을 배우고 있습니다</p>
    </main>
  );
}
```

위 코드에서 `className` 안의 `text-4xl`, `font-bold` 등은 **Tailwind CSS** 클래스이다. 3장에서 자세히 배운다. 지금은 복사하여 사용하면 된다.

**표 1.9** 지금 바로 쓸 수 있는 Tailwind 클래스

| 클래스 | 효과 |
| --- | --- |
| `text-xl` | 중간 텍스트 (20px) |
| `text-gray-600` | 회색 글씨 |
| `p-24` | 안쪽 여백 96px |
| `items-center` | 세로 가운데 정렬 |
| `min-h-screen` | 최소 높이 = 화면 전체 |

> 클래스 이름을 바꿔보며 변화를 확인하는 것이 가장 빠른 학습 방법이다. `text-4xl`을 `text-2xl`로 바꾸면 글씨가 작아지고, `text-gray-600`을 `text-blue-600`으로 바꾸면 파란색이 된다.
> 

---

## 개인 실습

### 체크포인트 1: 환경 확인 + page.js 수정

**목표**: 개발 서버가 정상 동작하고, page.js를 수정할 수 있다.

① 터미널에서 `node --version`, `git --version` 으로 설치를 확인한다

② `npm install` → `npm run dev`로 개발 서버를 실행한다

③ 브라우저에서 http://localhost:3000 을 열어 페이지를 확인한다

④ `app/page.js`를 열고 기본 내용을 삭제한다

⑤ 본인 이름과 자기소개를 작성한다

### 체크포인트 2: 블로그 첫 페이지 완성 + Tailwind 스타일링

**목표**: Tailwind 클래스로 보기 좋은 블로그 첫 페이지를 만든다.

① 표 1.9의 Tailwind 클래스를 참고하여 스타일을 적용한다

② 텍스트 크기, 색상, 정렬을 자유롭게 조정한다

③ 추가 정보(학교, 전공, 취미 등)를 넣어도 좋다

④ 브라우저에서 실시간으로 변화를 확인한다 (핫 리로드)

### 체크포인트 3: git push + Vercel 배포 확인

**목표**: 코드를 GitHub에 올리고 Vercel 자동 배포를 확인한다.

① 터미널에서 git 명령어를 실행한다:

```bash
git add .
git commit -m "Ch1: 블로그 첫 페이지"
git push
```

② GitHub 저장소 페이지에서 코드가 올라갔는지 확인한다

③ Vercel 대시보드에서 자동 배포가 시작되었는지 확인한다

④ 배포 완료 후 URL을 브라우저에서 열어본다

⑤ 모바일에서도 접속해본다 (본인 스마트폰)

> **트러블슈팅**: `git push`에서 인증 오류가 나면 `gh auth login` 또는 Personal Access Token을 사용한다. 자세한 방법은 부록 A 참고.
> 

---

## 검증 체크리스트

**표 1.10** Ch1 검증 체크리스트

| 항목 | 확인 | `npm run dev`로 개발 서버가 실행되는가? | ☐ |
| --- | --- | --- | --- |
| [localhost:3000](http://localhost:3000)에서 블로그 첫 페이지가 보이는가? | ☐ | 본인 이름과 자기소개가 표시되는가? | ☐ |
| git push가 성공했는가? | ☐ | Vercel 배포 URL에서 페이지가 정상 동작하는가? | ☐ |

---

## 흔한 실수

**표 1.11** Ch1에서 자주 발생하는 실수

| 실수 | 증상 | 해결 | Node.js 미설치 | `npx: command not found` | Node.js LTS 설치 |
| --- | --- | --- | --- | --- | --- |
| 프로젝트 폴더 밖에서 `npm run dev` | `Missing script: dev` | `cd my-blog`으로 폴더 이동 | `git push` 인증 실패 | `Authentication failed` | `gh auth login` 또는 PAT 발급 |
| Vercel에 저장소가 안 보임 | Import 목록 비어있음 | GitHub 앱 권한 재설정 | 기본 템플릿 미삭제 | 블로그 첫 페이지 대신 Next.js 기본 페이지 | `app/page.js` 내용 교체 |

---

## 제출 안내 (Google Classroom)

Google Classroom의 "Ch1 과제"에 아래 항목을 제출한다:

```
① 배포 URL
  예: https://my-blog-xxxxx.vercel.app
```

> Ch1은 첫 수업이므로 "AI가 틀린 부분" 항목은 없다. 배포 URL만 제출한다.
> 

---

## 참고 구현

> 제출 마감 후 모범 구현을 확인한다. 자기 코드와 비교해 차이점을 찾고 수정한다.
> 

**진행 순서**:

| 시간 | 활동 |
| --- | --- |
| 7분 | 자기 코드와 참고 구현을 비교 — 다른 부분 3개 이상 찾기 |
| 3분 | 핵심 차이점 1~2개 정리 |

**비교 포인트**:

- 프로젝트 구조: `app/` 폴더 안의 파일 배치가 동일한가?
- Tailwind 클래스: 비슷한 스타일링인데 다른 클래스를 사용했는가?
- git 커밋: 모범 구현은 어떤 단위로 커밋했는가?

---

## TypeScript 변환 완료 (2026-03-23)

### 파일명 참조 일괄 업데이트

- 모든 .js 파일명을 .tsx (컴포넌트) 또는 .ts (유틸리티)로 변경
- 총 80개+ 파일 참조 변경
- package.json, 폴더 구조, 과제 안내 모두 업데이트

### 실습 안내

- Ch1B: 기본 컴포넌트 구조는 이미 .tsx
- Ch5B: 데이터 파일 예제에 Post 인터페이스 추가
- Ch8B-Ch13B: 모두 TypeScript 타입 적용 완료

### 과제 제출 시 확인사항

생성된 모든 파일이 .tsx/.ts 확장자인지 확인하세요.