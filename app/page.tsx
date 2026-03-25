export default function Page() {
  const posts = [
    {
      id: 1,
      title: "첫 번째 포스트 제목",
      excerpt: "이곳에 짧은 요약을 넣습니다. 블로그 포스트 미리보기 텍스트입니다.",
      date: "2026-03-25",
    },
    {
      id: 2,
      title: "두 번째 포스트 제목",
      excerpt: "두 번째 포스트의 간단한 설명입니다.",
      date: "2026-03-20",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">신진철의 블로그</h1>
          <nav className="space-x-4 text-sm">
            <a href="#" className="text-zinc-600 hover:text-zinc-900">Home</a>
            <a href="#" className="text-zinc-600 hover:text-zinc-900">About</a>
            <a href="#" className="text-zinc-600 hover:text-zinc-900">Contact</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold">소개</h2>
            <p className="mt-3 text-zinc-600">학교: 한신대학교 · 전공: 공공인재빅데이터융합학과 · 취미: 운동</p>
          </div>
        </section>

        <section className="grid gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{post.excerpt}</p>
              <div className="mt-4 text-xs text-zinc-500">{post.date}</div>
            </article>
          ))}
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} 신진철
      </footer>
    </div>
  );
}
