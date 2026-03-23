# A회차: 강의

> **미션**: 수업이 끝나면 내 웹사이트가 인터넷에 올라간다
> 

---

## 학습목표

1. 웹이 동작하는 기본 구조(클라이언트-서버, HTTP)를 설명할 수 있다
2. Node.js, VS Code, Git을 설치하고 개발 환경을 구성할 수 있다
3. create-next-app으로 Next.js 프로젝트를 생성하고 개발 서버를 실행할 수 있다
4. Git으로 코드를 GitHub에 올릴 수 있다
5. Vercel을 통해 웹사이트를 인터넷에 배포할 수 있다

---

---

## 오늘의 미션

> **오늘의 질문**: "주소창에 URL을 입력하면 화면이 나타나기까지 무슨 일이 벌어지는가?"
> 

**빠른 진단** :

웹에서 "서버"의 역할은?

- (A) 사용자가 보는 화면을 그린다
- (B) 요청을 받아 HTML, CSS, JS 파일을 보내준다
- (C) 키보드 입력을 처리한다

정답: (B) — 서버는 요청을 받아 파일을 보내주고, 화면을 그리는 것은 브라우저(클라이언트)의 역할이다.

---

## 1.1 웹이 동작하는 방식

웹 프로그래밍을 시작하기 전에, 웹이 어떻게 동작하는지 큰 그림을 이해해야 한다. 세부적인 내용을 외울 필요는 없다. "내가 만든 코드가 어떤 과정을 거쳐 화면에 나타나는가"를 이해하는 것이 목표이다.

### 1.1.1 클라이언트-서버 아키텍처

웹은 **클라이언트**(Client)와 **서버**(Server) 두 역할로 나뉜다.

비유하자면 식당과 같다. 손님(클라이언트)이 메뉴를 주문하면, 주방(서버)이 음식을 만들어 내온다. 손님은 음식을 직접 만들지 않고, 주방은 손님이 누구인지 신경 쓰지 않는다. 각자 역할이 분리되어 있다.

웹에서도 마찬가지이다:

- **클라이언트**: 웹 브라우저(Chrome, Safari 등). 사용자가 URL을 입력하면 서버에 "이 페이지를 보여달라"고 요청한다.
- **서버**: 요청을 받아 HTML, CSS, JavaScript 파일을 보내준다. 우리가 Vercel에 배포하면, Vercel이 서버 역할을 대신한다.

```
[브라우저] ---요청(Request)---> [서버]
[브라우저] <--응답(Response)--- [서버]
```

이 수업에서 우리는 Next.js로 웹 앱을 만들고, Vercel이 서버 역할을 하도록 배포한다. 즉, 코드를 작성하면 Vercel이 전 세계 누구에게나 그 페이지를 보여준다.

### 1.1.2 HTTP 요청과 응답의 흐름

클라이언트와 서버가 대화하는 규칙을 **HTTP**(HyperText Transfer Protocol)라 한다.

브라우저 주소창에 URL을 입력하면 다음과 같은 일이 벌어진다:

1. 브라우저가 URL에서 서버 주소를 파악한다
2. 서버에 HTTP **요청**(Request)을 보낸다
3. 서버가 요청을 처리하고 HTTP **응답**(Response)을 돌려보낸다
4. 브라우저가 응답(HTML, CSS, JS)을 받아 화면을 그린다

자주 보게 될 HTTP 상태 코드가 있다:

**표 1.2** 주요 HTTP 상태 코드

| 코드 | 의미 | 쉽게 말하면 |
| --- | --- | --- |
| 301 | Moved Permanently | 주소가 바뀌었다 |
| 500 | Internal Server Error | 서버에 문제가 생겼다 |

404 에러는 주소를 잘못 입력했을 때 나타난다. 500 에러는 서버 측 코드에 버그가 있을 때 나타난다. 이 숫자들은 앞으로 자주 만나게 된다.

### 1.1.3 브라우저가 화면을 그리는 과정

서버에서 HTML, CSS, JavaScript 파일을 받으면 브라우저는 다음 순서로 화면을 그린다:

1. **HTML 파싱**: HTML을 읽어 **DOM**(Document Object Model) 트리를 만든다
2. **CSS 파싱**: CSS를 읽어 스타일 정보를 정리한다
3. **렌더링**: DOM + CSS를 합쳐 화면에 그린다
4. **JavaScript 실행**: JS가 DOM을 조작하여 화면을 동적으로 변경한다

지금은 이 흐름의 존재를 아는 것으로 충분하다. 3장(HTML)과 4장(JavaScript)에서 각 단계를 실습하며 자연스럽게 익히게 된다.

---

## 1.2 개발 환경 설정

이 절에서 필요한 도구를 모두 설치한다. macOS를 기준으로 안내한다.

> **실습 안내**: 안내 화면을 참고해 Node.js와 VS Code를 동시에 설치한다.
> 

### 1.2.1 Node.js 설치

**Node.js**는 JavaScript를 브라우저 밖에서도 실행할 수 있게 해주는 런타임이다. Next.js 프로젝트를 만들고 실행하려면 반드시 필요하다.

**설치 방법**:

1. https://nodejs.org 에 접속한다
2. **LTS**(Long Term Support) 버전을 다운로드한다 (안정 버전)
3. 설치 파일을 실행하고, 모든 옵션을 기본값으로 진행한다

**설치 확인** — 터미널(Terminal)을 열고 입력한다:

```bash
node --version
```

`v20.x.x` 또는 `v22.x.x` 형태의 버전 번호가 나오면 성공이다.

```bash
npm --version
```

npm은 Node.js와 함께 자동으로 설치되는 패키지 관리자이다. 버전 번호가 나오면 된다.

> **터미널 여는 방법**
> 

> Spotlight(`Cmd + Space`)에서 "Terminal" 검색
> 

### 1.2.2 VS Code 설치 및 필수 확장

**VS Code**(Visual Studio Code)는 이 수업에서 사용하는 코드 에디터이다.

**설치 방법**:

1. https://code.visualstudio.com 에 접속한다
2. 운영체제에 맞는 버전을 다운로드하여 설치한다

**필수 확장(Extension) 설치**:

VS Code 왼쪽 사이드바에서 확장 아이콘(네모 블록 모양)을 클릭하고, 다음을 검색하여 설치한다:

**표 1.3** VS Code 필수 확장

| 확장명 | 용도 | Korean Language Pack | VS Code 한국어 지원 |
| --- | --- | --- | --- |
| Prettier - Code formatter | 코드 자동 정렬 | ES7+ React/Redux/React-Native snippets | React 코드 자동완성 |

> GitHub Copilot과 Tailwind CSS IntelliSense는 2장에서 설치한다.
> 

### 1.2.3 Git 설치 및 GitHub 계정 생성

**Git**은 코드의 변경 이력을 관리하는 도구이다. **GitHub**는 Git 저장소를 인터넷에 올려두는 서비스이다.

**Git 설치**:

터미널에서 `git --version`을 입력하면 Xcode Command Line Tools 설치 안내가 나온다. 안내에 따라 설치한다. 또는 https://git-scm.com 에서 다운로드한다.

설치 확인:

```bash
git --version
```

**GitHub 계정 생성**:

1. https://github.com 에 접속하여 회원가입한다
2. 학교 이메일(.[ac.kr](http://ac.kr))로 가입하면 GitHub Education 혜택(Copilot 무료 등)을 받을 수 있다

**Git 초기 설정** — 터미널에서 이름과 이메일을 등록한다:

```bash
git config --global user.name "본인 이름"
git config --global user.email "본인@이메일.com"
```

### 1.2.4 터미널 기본 명령어

앞으로 터미널을 자주 사용한다. 최소한 다음 명령어를 알아야 한다:

**표 1.4** 터미널 기본 명령어

| 명령어 | 기능 | 예시 | `cd 폴더명` | 폴더 이동 | `cd my-project` |
| --- | --- | --- | --- | --- | --- |
| `cd ..` | 상위 폴더로 이동 | `cd ..` | `ls` | 현재 폴더 파일 목록 | `ls` |
| `mkdir 폴더명` | 새 폴더 생성 | `mkdir projects` | `pwd` | 현재 위치 확인 | `pwd` |

---

## 1.3 Next.js 프로젝트 생성

> **라이브 코딩**: create-next-app부터 Vercel 배포까지 전 과정을 실행한다.
> 

이제 실제로 웹 프로젝트를 만든다. **Next.js**는 React 기반 웹 프레임워크로, 페이지 라우팅, 서버 렌더링, 배포 최적화 등을 제공한다. 지금은 "웹사이트를 쉽게 만들어주는 도구"라고 이해하면 된다.

### 1.3.1 npx create-next-app@latest

터미널을 열고, 프로젝트를 만들 폴더로 이동한 뒤 다음 명령어를 실행한다:

```bash
npx create-next-app@latest my-first-web
```

설치 중 질문이 나오면 다음과 같이 선택한다:

```
Would you like to use TypeScript?               → No
Would you like to use ESLint?                    → Yes
Would you like to use Tailwind CSS?              → Yes
Would you like your code inside a `src/` directory? → No
Would you like to use App Router? (recommended)  → Yes
Would you like to use Turbopack for next dev?    → Yes
Would you like to customize the import alias?    → No
```

> **Tailwind CSS**를 Yes로 선택한다. 3장부터 사용할 CSS 도구이다.
> 

> **App Router**를 Yes로 선택한다. Next.js의 최신 라우팅 방식이다.
> 

설치가 완료되면 프로젝트 폴더로 이동한다:

```bash
cd my-first-web
```

**설치된 버전 확인** — `@latest`는 실행 시점의 최신 버전을 설치한다. 어떤 버전이 설치되었는지 반드시 확인한다:

```bash
# package.json에서 설치된 버전 확인
node -e "const p = require('./package.json'); console.log('next:', p.dependencies.next)"
```

```
next: 15.x.x    ← 실행 시점에 따라 다르다 (16.x, 17.x 등이 될 수 있다)
```

이 버전 번호를 기억해두자. **Ch2에서 [copilot-instructions.md](http://copilot-instructions.md)에 이 버전을 기록**하면 AI가 올바른 버전의 코드를 생성하도록 유도할 수 있다.

### 1.3.2 프로젝트 구조 살펴보기

VS Code에서 프로젝트를 연다:

```bash
code .
```

> `code .`이 동작하지 않으면: VS Code를 열고 → `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH" 실행. 또는 File → Open Folder → 해당 폴더 선택
> 

주요 파일과 폴더는 다음과 같다:

**표 1.5** Next.js 프로젝트 주요 구조

| 파일/폴더 | 역할 |
| --- | --- |
| `app/page.js` | 메인 페이지 (`/` 경로) |
| `app/globals.css` | 전역 스타일 (Tailwind 설정 포함) |
| `package.json` | 프로젝트 설정과 의존성 목록 |
| `tailwind.config.js` | Tailwind CSS 설정 파일 |

지금 가장 중요한 파일은 `app/page.js`이다. 이 파일의 내용이 웹사이트의 첫 화면에 나타난다.

### 1.3.3 개발 서버 실행: npm run dev

터미널에서 다음 명령어를 실행한다:

```bash
npm run dev
```

다음과 같은 메시지가 나타난다:

```
▲ Next.js (turbo)
- Local:    http://localhost:3000
```

브라우저에서 http://localhost:3000 을 열면 Next.js 기본 페이지가 나타난다.

[**localhost:3000**](http://localhost:3000)의 의미:

- `localhost`: 내 컴퓨터 자신을 가리키는 주소
- `3000`: 개발 서버가 사용하는 포트 번호

이 상태에서 `app/page.js`를 수정하면 브라우저에 즉시 반영된다. 이것을 **핫 리로드**(Hot Reload)라 한다.

> 개발 서버를 종료하려면 터미널에서 `Ctrl + C`를 누른다.
> 

### 1.3.4 DevTools 실습: 요소/콘솔/네트워크 탭

브라우저에서 개발자 도구(**DevTools**)를 열어보자.

**여는 방법**: 브라우저에서 `Cmd + Option + I` (또는 `F12`)

**표 1.6** DevTools 주요 탭

| 탭 | 용도 | 지금 해볼 것 | Elements | HTML 구조와 CSS 확인 | 페이지의 텍스트를 클릭해서 HTML 위치 확인 |
| --- | --- | --- | --- | --- | --- |
| Console | JavaScript 실행, 에러 확인 | `console.log("Hello")` 입력해보기 | Network | HTTP 요청/응답 확인 | 페이지 새로고침 후 요청 목록 살펴보기 |

DevTools는 앞으로 매주 사용하게 된다. 에러가 발생하면 **Console** 탭을, 페이지가 안 열리면 **Network** 탭을 가장 먼저 확인한다.

---

## 1.4 GitHub에 올리기

로컬에서 만든 프로젝트를 GitHub에 올린다. GitHub에 올려야 Vercel에서 자동으로 배포할 수 있다.

### 1.4.1 git init, add, commit, push

`create-next-app`은 Git 저장소를 자동으로 초기화한다. 이미 `.git` 폴더가 생성되어 있으므로 `git init`은 필요 없다.

현재 상태를 확인한다:

```bash
git status
```

파일들이 이미 커밋되어 있다면 다음 단계로 넘어간다. 커밋이 안 되어 있다면:

```bash
git add .
git commit -m "Initial commit: create-next-app"
```

**표 1.7** Git 기본 명령어

| 명령어 | 의미 | 비유 | `git add .` | 모든 변경 파일을 "준비 상태"로 올린다 | 택배 상자에 물건 넣기 |
| --- | --- | --- | --- | --- | --- |
| `git commit -m "메시지"` | 준비된 파일을 하나의 기록으로 저장한다 | 택배 상자에 송장 붙이기 | `git push` | 로컬 기록을 GitHub에 올린다 | 택배 발송하기 |

### 1.4.2 GitHub 저장소 생성 및 연결

1. GitHub([https://github.com)에](https://github.com)에)에) 로그인한다
2. 오른쪽 상단 `+` → **New repository** 클릭
3. Repository name에 `my-first-web` 입력
4. **Public** 선택
5. **나머지 옵션은 모두 체크 해제** (README, .gitignore, license 모두 해제)
6. **Create repository** 클릭

생성 후 나오는 화면에서 `...or push an existing repository from the command line` 부분의 명령어를 복사하여 터미널에 붙여넣는다:

```bash
git remote add origin https://github.com/본인아이디/my-first-web.git
git branch -M main
git push -u origin main
```

> **인증 오류가 나는 경우**: GitHub에서 Personal Access Token을 생성하거나, GitHub CLI(`gh auth login`)를 사용한다. 자세한 방법은 부록 A를 참고한다.
> 

GitHub 저장소 페이지를 새로고침하면 코드가 올라간 것을 확인할 수 있다.

---

## 1.5 Vercel 배포

이제 GitHub에 올린 코드를 **Vercel**을 통해 인터넷에 배포한다. 배포가 완료되면 누구나 접속할 수 있는 URL이 생성된다.

### 1.5.1 Vercel 가입 및 GitHub 연동

1. https://vercel.com 에 접속한다
2. **Sign Up** → **Continue with GitHub** 선택
3. GitHub 계정으로 로그인하고 권한을 승인한다

### 1.5.2 프로젝트 임포트

1. Vercel 대시보드에서 **Add New...** → **Project** 클릭
2. **Import Git Repository** 에서 `my-first-web` 저장소를 찾아 **Import** 클릭
3. 설정 화면에서 아무것도 변경하지 않고 **Deploy** 클릭

배포가 진행되며, 1-2분 후 완료된다.

### 1.5.3 자동 배포 확인: push → 배포

배포가 완료되면 `https://my-first-web-xxxxx.vercel.app` 형태의 URL이 생성된다. 이 URL을 브라우저에서 열면 아까 [localhost:3000](http://localhost:3000)에서 보던 것과 동일한 페이지가 나타난다.

**자동 배포의 원리**:

```
코드 수정 → git push → GitHub 업데이트 → Vercel이 감지 → 자동 재배포
```

Vercel은 GitHub 저장소를 감시하고 있다. `git push`를 할 때마다 자동으로 새 버전을 배포한다. 별도의 배포 명령이 필요 없다.

이것이 이 수업의 핵심 흐름이다. **코드 수정 → push → 배포**. 매주 이 과정을 반복한다.

---

## 핵심 정리 + B회차 과제 스펙

### 이번 시간 핵심 3가지

1. 웹은 **클라이언트(브라우저)**가 **서버**에 요청을 보내고, 서버가 응답을 돌려보내는 구조이다
2. **create-next-app**으로 프로젝트를 만들고, **npm run dev**로 개발 서버를 실행한다
3. **git push → Vercel 자동 배포** — 이 흐름을 매주 반복한다

### B회차 과제 스펙

**블로그 첫 페이지 수정 + 배포**:

1. `app/page.js` 파일에서 기본 Next.js 템플릿 내용을 삭제한다
2. 본인의 이름과 한 줄 자기소개를 표시한다
3. Tailwind CSS 클래스로 간단히 스타일링한다
4. git push하여 Vercel에 자동 배포한다
5. 배포된 URL을 Google Classroom에 제출한다

B회차에서는 A회차에서 `create-next-app`으로 만든 프로젝트를 그대로 이어서 사용한다.

---

## Exit ticket

다음 중 올바른 순서는?

```
(A) git push → git add → git commit
(B) git add → git push → git commit
(C) git add → git commit → git push
```

정답: (C) — add(준비) → commit(기록) → push(발송) 순서이다.