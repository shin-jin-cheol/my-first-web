export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">신진철의 블로그</h1>
        <nav className="mt-2 space-x-4 text-sm">
          <a href="#" className="text-gray-700">Home</a>
          <a href="#" className="text-gray-700">About</a>
          <a href="#" className="text-gray-700">Contact</a>
        </nav>
      </header>

      <main>
        <section>
          <h2 className="text-xl font-semibold mb-4">최신 게시글</h2>

          <article className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-bold">첫 번째 포스트 제목</h3>
            <p className="text-gray-600">이곳에 짧은 요약을 넣습니다. 블로그 포스트 미리보기 텍스트입니다.</p>
            <p className="mt-3">
              <strong>작성자:</strong> 작성자 A <span> | </span>{' '}
              <time className="text-sm text-gray-400">2026-03-28</time>
            </p>
          </article>

          <article className="mt-6 bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-bold">두 번째 포스트 제목</h3>
            <p className="text-gray-600">두 번째 포스트의 간단한 설명입니다.</p>
            <p className="mt-3">
              <strong>작성자:</strong> 작성자 B <span> | </span>{' '}
              <time className="text-sm text-gray-400">2026-03-26</time>
            </p>
          </article>

          <article className="mt-6 bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-bold">세 번째 포스트 제목</h3>
            <p className="text-gray-600">세 번째 포스트의 미리보기 텍스트입니다.</p>
            <p className="mt-3">
              <strong>작성자:</strong> 작성자 C <span> | </span>{' '}
              <time className="text-sm text-gray-400">2026-03-20</time>
            </p>
          </article>
        </section>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} 신진철</p>
      </footer>
    </div>
  );
}
