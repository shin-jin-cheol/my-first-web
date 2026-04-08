# Chapter 4. JavaScript 핵심

> **미션**: JavaScript로 페이지에 생명을 불어넣는다
> 

---

## 학습목표

1. 변수(let, const)와 자료형을 이해하고 코드를 읽을 수 있다
2. 함수 선언, 화살표 함수를 이해하고 AI 생성 코드에서 구분할 수 있다
3. 배열 메서드(map, filter, find)를 읽고 동작을 설명할 수 있다
4. async/await와 fetch를 이해하고 API 호출 코드를 검증할 수 있다
5. import/export 모듈 시스템을 이해할 수 있다

---

## 0. JavaScript와 TypeScript 기초

이 장은 "기능부터 바로 붙이기" 전에, JavaScript가 정확히 무슨 역할을 하는지 먼저 정리하고 시작한다.

### 먼저 큰 그림 보기

학생들이 자주 헷갈리는 부분은 "HTML, CSS, JavaScript가 각각 무엇을 담당하는가?"이다.

아주 간단히 정리하면:

1. HTML: 웹페이지의 구조를 만든다
2. CSS: 웹페이지의 모양을 꾸민다
3. JavaScript: 웹페이지를 동작하게 만든다
4. React: JavaScript로 화면을 부품처럼 나누어 만드는 방식
5. Next.js: React 프로젝트를 실제 앱 구조로 운영하기 쉽게 만든 프레임워크

즉, 3장에서 HTML과 CSS로 화면의 구조와 모양을 만들었다면, 4장에서는 그 화면에 "동작"을 넣는 언어를 다룬다.

비유하면:

- HTML: 뼈대
- CSS: 디자인
- JavaScript: 움직임과 반응
- React: 화면을 부품처럼 관리하는 방식
- Next.js: React 앱을 실제 서비스 구조로 운영하는 도구

### 아주 짧은 흐름 정리

초기의 웹은 문서를 보여주는 HTML 중심이었다.

그다음 CSS가 붙으면서 색, 글꼴, 여백, 배치 같은 시각적 표현을 다룰 수 있게 되었다.

하지만 버튼을 눌렀을 때 메뉴가 열리거나, 서버에서 데이터를 가져와 화면을 바꾸는 일은 HTML과 CSS만으로 처리할 수 없다. 이때 필요한 것이 JavaScript이다.

이후 웹앱이 커지면서 JavaScript 코드도 복잡해졌고, 이를 더 체계적으로 관리하기 위해 React가 널리 쓰이게 되었다. Next.js는 그 React 프로젝트를 실제 서비스 형태로 구성하기 쉽게 도와준다.

이번 장에서는 이 전체 흐름 중에서 JavaScript의 핵심 문법과, React/Next.js 코드에서 자주 마주치는 패턴에 집중한다.

### JavaScript와 TypeScript를 함께 보는 이유

이 장 제목은 JavaScript이지만, 실습 파일은 대부분 `ts` 또는 `tsx` 확장자를 사용한다. 즉, 실제 프로젝트에서는 **TypeScript 문법이 섞인 JavaScript**를 읽게 된다.

학생 입장에서는 이렇게 이해하면 충분하다:

1. JavaScript가 기본이다
2. TypeScript는 JavaScript에 타입 정보를 추가한 것이다
3. 따라서 JavaScript 개념을 먼저 이해해야 TypeScript 코드도 읽힌다

예를 들어 아래 코드는 TypeScript 문법이 들어 있지만, 핵심 동작은 JavaScript이다.

```tsx
const name: string = "홍길동";
const age: number = 20;
```

여기서 중요한 것은:

- `const`로 변수를 선언했다
- 문자열과 숫자 값을 저장했다

즉, 타입 표기(`: string`, `: number`)가 조금 붙었을 뿐, 본질은 JavaScript 문법 학습이다.

### 이번 장에서 특히 볼 것

이번 장에서 학생이 특히 익숙해져야 하는 것은 아래 5가지이다.

| 항목 | 왜 중요한가 |
| --- | --- |
| `const`, `let` | 값을 어떻게 선언하는지 이해해야 한다 |
| 함수 | 코드를 묶고 재사용하는 기본 단위이다 |
| 객체와 배열 | API 응답 데이터를 읽는 기본 구조이다 |
| `async/await`, `fetch` | 서버 데이터 조회 코드의 핵심이다 |
| `import`, `export` | 파일을 나누고 연결하는 기본 방식이다 |

### 빠른 점검

아래 코드를 보고 무엇이 일어나는지 말할 수 있으면, 이번 장을 시작할 준비가 된 것이다.

```tsx
const posts = ["React", "Next.js", "TypeScript"];
const uppercased = posts.map(post => post.toUpperCase());
```

- `posts`: 문자열 3개가 들어 있는 배열
- `map(...)`: 배열의 각 요소를 변환한다
- `uppercased`: 모두 대문자로 바뀐 새 배열

즉, JavaScript는 "값을 저장하고, 가공하고, 필요하면 새 값으로 바꾸는 언어"라고 이해하면 된다.

---

## 실습 전 준비

이 장은 JavaScript 문법을 설명하면서, 이후 B회차에서 API 호출과 화면 렌더링 실습으로 이어진다.

실습 시작 전 먼저 확인:

- [ ]  프로젝트 폴더가 VS Code에서 열려 있는가?
- [ ]  터미널에서 `npm run dev`를 실행했는가?
- [ ]  브라우저에서 `http://localhost:3000`이 열리는가?
- [ ]  앞으로 수정하게 될 파일이 `app/page.tsx`, `components/`, `lib/` 주변이라는 점을 알고 있는가?

문제가 생기면 먼저 확인:

1. 개발 서버가 꺼져 있지 않은가?
2. 다른 프로젝트 폴더를 열어 둔 것은 아닌가?
3. 저장 후 브라우저를 새로고침했는가?

---

## 이번 실습의 완성 목표

최종 결과는 아래와 같은 "더미 API 연동 블로그"이다.

```
┌─────────────────────────────────────────────┐
│ 검색창            [전체] [User1] [User2]    │
├─────────────────────────────────────────────┤
│ 게시글 카드                                  │
│ 제목 / 내용 / userId                         │
├─────────────────────────────────────────────┤
│ 게시글 카드                                  │
│ 제목 / 내용 / userId                         │
├─────────────────────────────────────────────┤
│ 입력값과 버튼에 따라 목록이 바뀜             │
└─────────────────────────────────────────────┘
```

이번 장의 실습 목표는 아래 5가지이다.

1. JSONPlaceholder API에서 게시글을 가져온다
2. 가져온 데이터를 카드 형태로 화면에 표시한다
3. `userId` 필터 버튼을 추가한다
4. 제목 검색 기능을 추가한다
5. 최종 결과를 배포하고 검증한다

**사용할 API**: `https://jsonplaceholder.typicode.com/posts`

---

## 이번 장의 흐름

이번 장은 아래 순서로 진행된다.

1. 변수와 자료형으로 JavaScript의 가장 작은 단위를 이해한다
2. 함수 문법을 익혀 코드를 묶는 방식을 이해한다
3. 객체와 배열을 통해 실제 데이터 구조를 읽는 연습을 한다
4. `async/await`, `fetch`로 서버 데이터 요청 코드를 이해한다
5. `import`, `export`로 파일 분리 방식을 정리한다

즉, 이 장은 "문법 암기"보다 "AI가 생성한 코드를 읽고 검증할 수 있는가"에 초점을 둔다.

---

## 이 장을 읽는 기본 관점

이 장은 문법 사전처럼 외우는 자료가 아니다.

바이브 코딩을 하는 초보자에게 더 중요한 것은 아래 4가지이다.

1. 이 코드가 왜 있는지 말할 수 있는가
2. 값이 어디서 들어와서 어디로 흘러가는지 볼 수 있는가
3. AI가 만든 코드를 어느 정도 읽을 수 있는가
4. 이상한 코드를 받았을 때 어디를 의심해야 하는지 아는가

그래서 앞으로 코드를 읽을 때는 먼저 아래 4줄로 정리한다.

1. 역할: 이 코드는 무엇을 하려고 있는가
2. 입력: 어떤 값을 받는가
3. 처리: 안에서 그 값을 어떻게 다루는가
4. 결과: 마지막에 무엇을 돌려주는가

정의보다 이 흐름을 먼저 잡는 것이 실전에서 훨씬 유용하다.

---

## 4.1 변수, 자료형, 연산자

JavaScript는 웹 페이지에 **동작**을 부여하는 언어이다. HTML이 뼈대, CSS가 옷이라면 JavaScript는 근육이다. 버튼을 클릭하면 무언가가 일어나고, 서버에서 데이터를 가져와 화면에 보여주는 일을 모두 JavaScript가 담당한다.

### 4.1.1 let, const (var를 쓰지 않는 이유)

JavaScript에서 데이터를 담는 그릇을 **변수**(Variable)라 한다. 변수를 선언하는 키워드는 세 가지이지만, 실전에서는 두 가지만 사용한다:

```tsx
const name: string = "홍길동";  // 바뀌지 않는 값 → const
let count: number = 0;          // 바뀌는 값 → let
count = count + 1;              // let은 재할당 가능

// var는 사용하지 않는다
var oldStyle = "레거시";  // ❌ 호이스팅 문제 발생
```

**표 4.2** 변수 선언 키워드

| 키워드 | 재할당 | 스코프 | 사용 여부 |
| --- | --- | --- | --- |
| `const` | 불가 | 블록 | **기본 사용** |
| `let` | 가능 | 블록 | 재할당 필요 시 |
| `var` | 가능 | 함수 | **사용 금지** |

규칙은 간단하다: **기본은 `const`, 값이 바뀌어야 하면 `let`**. AI가 `var`로 코드를 생성하면 `const` 또는 `let`으로 수정한다.

> AI가 `var`를 사용하는 것은 오래된 학습 데이터의 영향이다. 2015년(ES6) 이후 `var`는 레거시 코드에서만 볼 수 있다.
> 

### 4.1.2 문자열, 숫자, 불리언, null, undefined

JavaScript의 기본 **자료형**(Data Type):

**표 4.3** JavaScript 자료형

| 자료형 | 예시 | 설명 |
| --- | --- | --- |
| 문자열(String) | `"안녕"`, `'hello'` | 텍스트 데이터 |
| 숫자(Number) | `42`, `3.14` | 정수와 소수 모두 Number |
| 불리언(Boolean) | `true`, `false` | 참/거짓 |
| null | `null` | "값이 없음"을 의도적으로 표현 |
| undefined | `undefined` | 값이 할당되지 않은 상태 |
| 객체(Object) | `{ name: "홍길동" }` | 여러 값을 묶은 구조 (4.3절) |
| 배열(Array) | `[1, 2, 3]` | 순서 있는 값의 목록 (4.3절) |

`null`과 `undefined`의 차이:

- `null`: 개발자가 "비어있다"고 명시한 것 (예: 로그아웃 후 `user = null`)
- `undefined`: 아직 값을 넣지 않은 것 (예: `let x;`이면 x는 undefined)

### 4.1.3 템플릿 리터럴

문자열 안에 변수를 넣을 때 **템플릿 리터럴**(Template Literal)을 사용한다. 백틱(```)으로 감싸고 `${}` 안에 변수를 넣는다:

```tsx
const name: string = "홍길동";
const age: number = 20;

// 템플릿 리터럴 (권장)
const greeting: string = `안녕하세요, ${name}님! ${age}세이시군요.`;

// 문자열 연결 (비권장 — 읽기 어렵다)
const greeting2: string = "안녕하세요, " + name + "님! " + age + "세이시군요.";
```

React(Next.js)에서 TSX 안에 JavaScript 값을 넣을 때도 `{}`를 사용하므로, 이 문법에 익숙해져야 한다.

## 4.2 함수

**함수**(Function)는 특정 작업을 수행하는 코드 묶음이다. 한 번 정의하면 이름을 불러 반복 사용할 수 있다.

### 4.2.1 함수 선언과 표현식

```tsx
// 함수 선언 (Function Declaration)
function greet(name: string): string {
  return `안녕하세요, ${name}님!`;
}
```

```tsx
// 함수 표현식 (Function Expression) — 같은 동작을 다른 문법으로 작성
const greetExpression = function(name: string): string {
  return `안녕하세요, ${name}님!`;
};
```

두 방식의 차이는 미묘하지만, AI가 생성하는 코드에서 두 형태 모두 볼 수 있으므로 읽을 수 있어야 한다.

### 4.2.2 화살표 함수

**화살표 함수**(Arrow Function)는 함수를 더 짧게 쓰는 현대적 문법이다. Next.js 코드에서 가장 많이 보게 될 형태이다:

```tsx
// 일반 함수
function add(a: number, b: number): number {
  return a + b;
}
```

```tsx
// 화살표 함수 (같은 동작)
const addArrow = (a: number, b: number): number => {
  return a + b;
};

// 한 줄이면 중괄호와 return 생략 가능
const addShort = (a: number, b: number): number => a + b;

// 매개변수가 하나면 괄호도 생략 가능
const double = (n: number): number => n * 2;
```

**표 4.4** 함수 형태 비교

| 형태 | 문법 | 주로 쓰이는 곳 |
| --- | --- | --- |
| 함수 선언 | `function 이름() {}` | 독립적인 함수 정의 |
| 화살표 함수 | `const 이름 = () => {}` | 콜백, 컴포넌트, 배열 메서드 |

Next.js에서 페이지 컴포넌트를 정의할 때 두 가지 형태를 모두 볼 수 있다:

```tsx
// 함수 선언 방식
export default function Home() {
  return <h1>홈페이지</h1>;
}

// 화살표 함수 방식
const Home = () => {
  return <h1>홈페이지</h1>;
};
export default Home;
```

두 방식 모두 동작은 동일하다. 이 수업에서는 **함수 선언 방식**을 기본으로 사용한다 (Next.js 공식 문서 스타일).

### 4.2.3 매개변수 기본값과 나머지 매개변수

```tsx
// 기본값 (default parameter)
function greet(name: string = "손님"): string {
  return `안녕하세요, ${name}님!`;
}
greet();          // "안녕하세요, 손님님!"
greet("홍길동");  // "안녕하세요, 홍길동님!"

// 나머지 매개변수 (rest parameter)
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3);     // 6
```

이 코드를 문법보다 흐름으로 읽으면 더 쉽다.

- `greet`는 이름을 받아 인사말을 만드는 함수이다
- 이름이 비어 있으면 미리 준비한 `"손님"`을 대신 쓴다
- 즉, 기본값은 "입력이 없을 때 대신 들어가는 예비값"이다
- `sum`은 숫자를 여러 개 받아 전부 더하는 함수이다
- `...numbers`는 여러 값을 한 번에 받겠다는 표시이다
- `number[]`는 숫자들이 한 묶음으로 들어 있다는 뜻이다

여기서 `reduce`는 숫자를 하나씩 더해 가며 최종 합계를 만드는 동작이다.
눈덩이를 굴리듯이, 처음에는 작게 시작해서 숫자를 만날 때마다 점점 커진다고 생각하면 된다.

예를 들어 `sum(1, 2, 3)`은 머릿속에서 이렇게 흘러간다.

1. 시작값 `0`
2. `0 + 1 = 1`
3. `1 + 2 = 3`
4. `3 + 3 = 6`

기본값은 API 호출에서 자주 사용한다. 예를 들어 페이지 번호의 기본값을 1로 설정하는 패턴이 흔하다.

---

## 4.3 객체와 배열

### 4.3.1 객체 리터럴과 프로퍼티 접근

**객체**(Object)는 관련된 데이터를 하나로 묶는 구조이다. 게시글을 예로 들면:

```tsx
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

const post: Post = {
  id: 1,
  title: "첫 번째 게시글",
  content: "안녕하세요!",
  author: "홍길동",
  createdAt: "2026-03-01",
};

// 프로퍼티 접근
post.title;          // "첫 번째 게시글"
post["author"];      // "홍길동"
```

Supabase에서 데이터를 가져오면 이런 객체 형태로 돌아온다. 객체를 읽을 줄 알아야 AI가 생성한 데이터 처리 코드를 검증할 수 있다.

### 4.3.2 배열 메서드: map, filter, find, reduce

**배열**(Array)은 순서 있는 데이터 목록이다. 게시글 목록, 사용자 목록 등이 모두 배열이다:

```tsx
const posts: { id: number; title: string; author: string }[] = [
  { id: 1, title: "첫 번째 글", author: "홍길동" },
  { id: 2, title: "두 번째 글", author: "김철수" },
  { id: 3, title: "세 번째 글", author: "홍길동" },
];
```

배열을 다루는 핵심 메서드 4가지:

**`map`** — 배열의 각 요소를 변환하여 새 배열을 만든다:

```tsx
// 게시글 제목만 뽑기
const titles: string[] = posts.map(post => post.title);
// ["첫 번째 글", "두 번째 글", "세 번째 글"]
```

직관적으로 보면 `map`은 재료의 개수는 유지한 채 모양만 바꾸는 변환기이다.

> React에서 리스트를 화면에 표시할 때 `map`을 사용한다. Next.js 코드에서 가장 자주 보게 될 메서드이다.
> 

**`filter`** — 조건에 맞는 요소만 골라낸다:

```tsx
// 홍길동의 글만 필터링
const myPosts = posts.filter(post => post.author === "홍길동");
// [{ id: 1, ... }, { id: 3, ... }]
```

`filter`는 조건에 맞는 것만 통과시키는 체라고 생각하면 된다.

**`find`** — 조건에 맞는 첫 번째 요소를 반환한다:

```tsx
// id가 2인 게시글 찾기
const found = posts.find(post => post.id === 2);
// { id: 2, title: "두 번째 글", author: "김철수" }
```

`find`는 여러 개 중에서 원하는 것 하나를 집어내는 동작이다.

**`reduce`** — 배열을 하나의 값으로 누적한다:

```tsx
const numbers: number[] = [10, 20, 30];
const total: number = numbers.reduce((sum, n) => sum + n, 0);
// 60
```

`reduce`는 하나씩 모아서 최종 결과를 만드는 누적기이다.

초보자는 배열 메서드를 처음부터 엄밀하게 외우기보다 이렇게 느끼면 충분하다.

- `map`: 바꾼다
- `filter`: 거른다
- `find`: 하나 찾는다
- `reduce`: 모아서 하나로 만든다

**표 4.5** 배열 메서드 요약

| 메서드 | 목적 | 반환값 | 블로그 예시 |
| --- | --- | --- | --- |
| `map` | 각 요소 변환 | 새 배열 | 게시글 → 카드 컴포넌트 |
| `filter` | 조건으로 걸러냄 | 새 배열 | 내 글만 보기 |
| `find` | 하나 찾기 | 요소 또는 undefined | id로 글 조회 |
| `reduce` | 누적 계산 | 단일 값 | 댓글 수 합산 |

---

## 4.4 비동기 프로그래밍

> **라이브 코딩 시연**: 공개 API(JSONPlaceholder)를 호출하여 데이터를 콘솔에 출력하고, 화면에 표시하는 과정을 시연한다. fetch → json 파싱 → map으로 리스트 렌더링 순서로 진행한다.
> 

웹에서 서버에 데이터를 요청하면 응답이 올 때까지 시간이 걸린다. 이 "기다리는 동안 다른 일을 할 수 있는" 방식이 **비동기**(Asynchronous) 프로그래밍이다.

### 4.4.1 동기 vs 비동기의 이해

비유하자면:

- **동기**: 식당에서 음식이 나올 때까지 자리에서 아무것도 하지 않고 기다린다
- **비동기**: 주문을 넣고 진동벨을 받는다. 벨이 울릴 때까지 다른 일을 한다

```tsx
// 동기적 코드 — 위에서 아래로 순서대로 실행
console.log("1번");
console.log("2번");
console.log("3번");
// 출력: 1번, 2번, 3번

// 비동기적 코드 — 서버 요청은 시간이 걸린다
console.log("요청 시작");
// fetch는 서버 응답을 "기다리는" 작업
fetch("<https://api.example.com/data>");
console.log("요청 끝 (응답은 아직 안 왔을 수 있음)");
```

### 4.4.2 Promise의 개념은 간단하게만

`Promise`는 "나중에 결과를 주겠다는 약속표" 정도로 이해하면 된다.

웹에서는 결과가 바로 나오지 않는 작업이 많다.

- API에서 데이터 가져오기
- 로그인 요청 보내기
- 파일 업로드하기
- 데이터베이스 조회하기

이런 작업은 시간이 걸리기 때문에, JavaScript는 "지금 당장 값은 없지만 작업이 끝나면 결과를 주겠다"는 방식으로 처리한다. 그 기다리는 결과를 담는 개념이 `Promise`이다.

즉, 아주 단순하게 말하면:

- 일반 값: 지금 바로 받는 결과
- `Promise`: 조금 있다가 받는 결과

왜 필요하냐면, 시간이 걸리는 작업마다 프로그램이 완전히 멈추면 웹앱을 만들 수 없기 때문이다.

### 4.4.3 async/await 패턴

이 수업에서 비동기 코드를 작성할 때는 항상 이 방식을 사용한다:

```tsx
// async 함수 안에서 await로 결과를 기다린다
async function getPosts(): Promise<Post[]> {
  const response = await fetch("<https://jsonplaceholder.typicode.com/posts>");
  const data: Post[] = await response.json();
  return data;
}
```

`await`는 "이 줄의 결과가 올 때까지 기다려라"라는 뜻이다. `await`는 반드시 `async` 함수 안에서만 사용할 수 있다.

### 4.4.4 fetch API로 데이터 가져오기

**fetch**는 서버에 HTTP 요청을 보내는 내장 함수이다:

```tsx
async function getPosts(): Promise<Post[]> {
  const response = await fetch("<https://jsonplaceholder.typicode.com/posts>");

  // fetch는 HTTP 에러(404, 500)에서 예외를 던지지 않는다!
  if (!response.ok) {
    throw new Error(`HTTP 에러: ${response.status}`);
  }

  const posts: Post[] = await response.json(); // JSON → TypeScript 객체로 변환
  return posts;
}
```

### 4.4.5 에러 처리: try-catch

서버 요청은 항상 실패할 수 있다. 네트워크가 끊기거나, 서버가 다운되거나, URL이 잘못되었을 수 있다. **try-catch**로 에러를 처리한다:

```tsx
async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch("<https://jsonplaceholder.typicode.com/posts>");
    if (!response.ok) {
      throw new Error(`HTTP 에러: ${response.status}`);
    }
    const posts: Post[] = await response.json();
    return posts;
  } catch (error) {
    console.error("데이터를 가져오지 못했습니다:", (error as Error).message);
    return []; // 에러 시 빈 배열 반환
  }
}
```

---

## 4.5 모듈 시스템

프로젝트가 커지면 하나의 파일에 모든 코드를 몰아넣을 수 없다.

예를 들어 날짜를 포맷하는 함수, 게시글 카드 UI, API 요청 코드까지 전부 `page.tsx` 한 파일에 들어가 있으면 읽기도 어렵고 수정도 힘들다.

그래서 코드를 역할별로 파일에 나눠 넣고, 필요한 파일에서 꺼내 쓰는 방식이 필요하다. 이것이 **모듈 시스템**이다.

아주 직관적으로 말하면:

- `export`: 이 파일의 부품을 밖으로 꺼내 놓는 것
- `import`: 다른 파일에서 그 부품을 가져오는 것

즉, 모듈 시스템은 **코드를 파일 단위로 나누고 서로 연결하는 방법**이다.

### 4.5.1 import/export

먼저 감각적으로 보면 아래와 같다.

1. `utils.ts` 파일에서 "이 함수 써도 됩니다" 하고 내보낸다
2. `page.tsx` 파일에서 "그 함수 가져와서 쓰겠습니다" 하고 받아온다

즉, `export`는 공개, `import`는 가져오기이다.

```tsx
// lib/utils.ts — 내보내기 (export)
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ko-KR");
}

export const APP_NAME: string = "블로그";
```

```tsx
// app/page.tsx — 가져오기 (import)
import { formatDate, APP_NAME } from "../lib/utils";

// default export — 파일당 하나
// lib/supabase.ts
export default function createClient() { ... }

// 가져올 때 이름을 자유롭게 지정
import supabase from "../lib/supabase";
```

이 코드를 흐름으로 읽으면 다음과 같다.

1. `lib/utils.ts` 안에 `formatDate`와 `APP_NAME`을 만들어 둔다
2. 앞에 `export`를 붙여서 "다른 파일에서도 사용 가능" 상태로 만든다
3. `app/page.tsx`에서 `import`로 필요한 것만 가져온다
4. 가져온 함수와 값을 현재 파일에서 바로 사용한다

비유하면:

- `export`: 공용 서랍에 도구를 넣어두는 것
- `import`: 그 서랍에서 필요한 도구를 꺼내 오는 것

이렇게 이해하면 충분하다.

- 함수가 길어지면 다른 파일로 뺀다
- 여러 곳에서 쓸 코드는 `export`한다
- 현재 파일에 필요한 것만 `import`한다

**표 4.7** export 방식 비교

| 방식 | 문법 | 가져올 때 | 파일당 |
| --- | --- | --- | --- |
| named export | `export function 이름()` | `import { 이름 } from` | 여러 개 |
| default export | `export default function()` | `import 아무이름 from` | 1개 |

### 4.5.2 모듈 구조 설계

Next.js 프로젝트에서 파일을 분리하는 일반적인 패턴:

```
app/
  page.tsx          ← 페이지 (UI)
  layout.tsx        ← 레이아웃
components/
  PostCard.tsx      ← 재사용 컴포넌트
lib/
  supabase.ts       ← Supabase 클라이언트
  utils.ts          ← 유틸리티 함수
```

이 구조를 직관적으로 읽으면:

- `app/`: 실제 화면과 라우팅(사용자가 방문하는 URL에 따라 어떤 페이지를 보여줄지 결정하는 기능)
- `components/`: 화면에서 재사용할 UI 부품
- `lib/`: 계산 함수, API 클라이언트, 공통 도구

즉, 파일을 나누는 이유는 "멋있어 보여서"가 아니라, **읽기 쉽고, 고치기 쉽고, 다시 쓰기 쉽게 만들기 위해서**이다.

바이브 코딩에서는 이 감각이 특히 중요하다.

AI가 코드를 생성했을 때도 아래처럼 판단할 수 있어야 한다.

1. 이 코드는 화면 코드인가?
2. 재사용 가능한 UI 부품인가?
3. 공통 함수나 API 연결 코드인가?

이 구조는 `copilot-instructions.md`에 명시해두면, AI가 새 기능을 추가할 때도 파일을 더 그럴듯한 위치에 만든다.

## 자주 보는 오류 메시지

**표 4.10** Ch4에서 자주 마주치는 오류 메시지

| 오류 메시지 예시 | 뜻 | 먼저 볼 것 |
| --- | --- | --- |
| `Cannot find module '../lib/utils'` | 가져오려는 파일 경로나 파일명이 맞지 않는다 | `import` 경로, 파일 위치, 확장자 |
| `Attempted import error` | `import` 방식과 `export` 방식이 서로 맞지 않는다 | named export인지 default export인지 |
| `Unexpected token '<'` | JSX가 들어 있는데 파일 확장자나 문법이 맞지 않을 수 있다 | `.ts` 대신 `.tsx`가 필요한지 |
| `Property 'map' does not exist on type ...` | 배열이라고 생각했는데 실제 타입이 배열이 아니다 | 데이터 구조, API 응답 형태 |
| `Cannot read properties of undefined` | 아직 값이 없는데 바로 속성을 읽으려 했다 | 초기값, 데이터 로딩 순서, null/undefined 체크 |
| `Objects are not valid as a React child` | 화면에 객체 자체를 그대로 출력하려 했다 | 객체의 특정 속성을 꺼내서 렌더링하는지 |
| `Failed to fetch` | 네트워크 요청 자체가 실패했다 | API 주소, 인터넷 연결, 서버 상태 |
| `Unexpected end of JSON input` | JSON으로 읽으려 했지만 응답 내용이 비었거나 깨졌다 | `response.json()` 전에 응답 상태와 내용 |
| `Hydration failed` | 서버에서 만든 화면과 브라우저에서 만든 화면이 다르다 | 클라이언트 전용 코드, 랜덤값, 시간값 사용 여부 |
| `You're importing a component that needs 'use client'` | 이벤트나 state를 쓰는 컴포넌트인데 Client Component 선언이 없다 | 파일 맨 위에 `"use client"` 필요 여부 |

초보자는 오류 메시지를 전부 번역하려고 하기보다, 먼저 아래처럼 보는 습관이 중요하다.

1. 경로 문제인가
2. 타입 문제인가
3. 값이 아직 없는데 먼저 쓴 것인가
4. 서버/클라이언트 구분 문제인가
5. API 응답 문제인가

---

## 핵심 정리

1. **`const`**(기본)와 **`let`**(변경 필요 시)만 사용한다. `var`는 금지
2. **함수**는 작업을 묶는 단위이며, 함수 선언과 화살표 함수를 모두 읽을 수 있어야 한다
3. **배열 메서드**: `map`(변환), `filter`(걸러내기), `find`(찾기)가 핵심이다
4. **비동기**: `async/await` + `fetch`로 서버 데이터를 가져오고, `response.ok`와 `try-catch`로 에러를 처리한다
5. **모듈 시스템**: `import`와 `export`로 코드를 파일 단위로 나눈다

---

## 스스로 점검

이 장을 마쳤다면 아래 질문에 답할 수 있어야 한다.

1. 왜 `var` 대신 `const`와 `let`을 써야 하는가?
2. `map`, `filter`, `find`는 각각 무엇을 하는가?
3. 왜 `fetch` 뒤에 `response.ok`를 확인해야 하는가?
4. `async/await`는 Promise와 어떤 관계인가?
5. `import`와 `export`는 왜 필요한가?

---

## 다음 장 예고

이번 장에서는 JavaScript와 TypeScript가 무엇인지, 그리고 AI가 생성한 코드를 어떤 기준으로 읽어야 하는지 정리했다.

실제 화면에서 데이터를 가져오고, 상태를 바꾸고, 사용자 입력에 따라 화면을 다시 그리는 작업은 다음 장에서 Next.js 흐름 안에서 다룬다. 즉, 블로그 API 실습은 5장으로 넘긴다.