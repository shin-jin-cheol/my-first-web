import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "공인재 신진철의 생존일기",
  description: "공인재 신진철의 생존일기 소개 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 via-rose-50 to-sky-50 text-slate-800">
        <nav className="border-b border-orange-200/70 bg-white/80 text-slate-700 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-6 px-6 py-4">
            <span className="rounded-full bg-gradient-to-r from-amber-400 to-rose-400 px-3 py-1 text-base font-bold text-white md:text-lg">
              공인재 신진철의 생존일기
            </span>
            <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-rose-500">
              홈
            </Link>
            <Link href="/posts" className="text-sm font-medium text-slate-600 transition hover:text-rose-500">
              블로그
            </Link>
            <Link
              href="/posts/new"
              className="rounded-full bg-gradient-to-r from-amber-400 to-rose-400 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              새 글 쓰기
            </Link>
          </div>
        </nav>
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
        <footer className="border-t border-orange-200/70 py-4 text-center text-sm text-slate-500">
          <p>© 2026 공인재 신진철의 생존일기</p>
          <a
            href="https://www.instagram.com/whflwls"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="인스타그램 바로가기"
            className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 shadow-sm transition hover:-translate-y-0.5 hover:text-rose-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm4.5 3.2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.1-2.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
            </svg>
            <span className="sr-only">인스타그램 바로가기 (@whflwls)</span>
          </a>
        </footer>
      </body>
    </html>
  );
}
