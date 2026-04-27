import type { Metadata } from "next";
import Link from "next/link";
import BgmPlayer from "./components/BgmPlayer";
import { clearSession, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getLocale, t } from "@/lib/i18n";
import { NavMenuMobile } from "./components/NavMenuMobile";
import "./globals.css";

export const metadata: Metadata = {
  title: "공인재 신진철의 생존일기",
  description: "공인재 신진철의 생존일기 소개 페이지",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const locale = await getLocale();
  const writeHref = session?.role === "owner" ? "/posts/new" : "/guest/new";
  const writeLabel =
    session?.role === "owner" ? t(locale, "새 글 쓰기", "Write") : t(locale, "게스트 글 쓰기", "Write Guest Post");

  async function logoutAction() {
    "use server";

    await clearSession();
    redirect("/auth/login");
  }

  async function setLanguageAction(formData: FormData) {
    "use server";

    const nextLang = String(formData.get("lang") ?? "ko");
    const store = await (await import("next/headers")).cookies();
    store.set("lang", nextLang === "en" ? "en" : "ko", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    const referer = (await headers()).get("referer") ?? "/";
    redirect(referer);
  }

  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-zinc-300 text-zinc-900 shadow-[inset_0_140px_140px_-120px_rgba(129,216,208,0.2)] dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[inset_0_120px_120px_-120px_rgba(129,216,208,0.22)] pb-24">
        <nav className="border-b border-zinc-500 bg-zinc-300 text-zinc-900 shadow-[0_0_30px_rgba(129,216,208,0.22)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_0_24px_rgba(129,216,208,0.18)]">
          <div className="mx-auto w-full max-w-4xl px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center justify-between gap-3 md:hidden">
              <span className="inline-flex h-9 min-w-0 flex-1 items-center truncate rounded-full border border-zinc-500 bg-zinc-300/92 px-3 text-sm font-extrabold tracking-[0.01em] text-zinc-900 drop-shadow-[0_0_10px_rgba(129,216,208,0.45)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-100 dark:drop-shadow-none dark:shadow-[0_0_14px_rgba(129,216,208,0.35)]">
                공인재 신진철의 생존일기
              </span>
              <div className="flex h-9 shrink-0 items-center gap-2">
                {session ? (
                  <span className="inline-flex h-9 items-center rounded-full border border-cyan-600/45 bg-cyan-500/12 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#2f8f88] shadow-[0_0_10px_rgba(129,216,208,0.35)] dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-200 dark:shadow-none">
                    {session.role}
                  </span>
                ) : null}
                {!session ? (
                  <Link href="/auth/login" className="inline-flex h-9 items-center rounded-full border border-zinc-500 bg-zinc-300/92 px-3 text-xs font-semibold text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-none dark:hover:bg-zinc-700">
                    {t(locale, "로그인", "Login")}
                  </Link>
                ) : (
                  <form action={logoutAction} className="inline-flex h-9 items-center">
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-full border border-zinc-500 bg-zinc-300/92 px-3 text-xs font-semibold text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-none dark:hover:bg-zinc-700"
                    >
                      {t(locale, "로그아웃", "Logout")}
                    </button>
                  </form>
                )}
                <NavMenuMobile
                  session={session}
                  serverLocale={locale}
                  setLanguageAction={setLanguageAction}
                />
              </div>
            </div>

            <div className="hidden flex-wrap items-center gap-x-4 gap-y-2 md:flex">
              <span className="inline-flex h-9 shrink-0 items-center rounded-full border border-zinc-500 bg-zinc-300/92 px-3 text-base font-extrabold tracking-[0.01em] text-zinc-900 drop-shadow-[0_0_12px_rgba(129,216,208,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-100 dark:drop-shadow-none dark:shadow-[0_0_14px_rgba(129,216,208,0.35)] md:text-lg">
                공인재 신진철의 생존일기
              </span>
              <Link href="/" className="inline-flex h-9 items-center text-sm font-medium text-zinc-700 transition hover:text-zinc-900 hover:drop-shadow-[0_0_12px_rgba(129,216,208,0.6)] dark:text-zinc-300 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(129,216,208,0.6)]">
                {t(locale, "홈", "Home")}
              </Link>
              <Link href="/posts" className="inline-flex h-9 items-center text-sm font-medium text-zinc-700 transition hover:text-zinc-900 hover:drop-shadow-[0_0_12px_rgba(129,216,208,0.6)] dark:text-zinc-300 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(129,216,208,0.6)]">
                {t(locale, "블로그", "Blog")}
              </Link>
              <Link href="/guest" className="inline-flex h-9 items-center text-sm font-medium text-zinc-700 transition hover:text-zinc-900 hover:drop-shadow-[0_0_12px_rgba(129,216,208,0.6)] dark:text-zinc-300 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(129,216,208,0.6)]">
                {t(locale, "게스트 게시판", "Guest Board")}
              </Link>
              {session ? (
                <Link
                  href={writeHref}
                  className="inline-flex h-9 items-center rounded-full border border-[#74cfc6] bg-[#81d8d0] px-3 text-sm font-semibold text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_6px_rgba(0,0,0,0.05),0_0_22px_rgba(129,216,208,0.68)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-3px_6px_rgba(0,0,0,0.05),0_0_30px_rgba(129,216,208,0.82)]"
                >
                  {writeLabel}
                </Link>
              ) : null}
              {session?.role === "owner" ? (
                <Link href="/admin/members" className="inline-flex h-9 items-center text-sm font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                  {t(locale, "회원관리", "Members")}
                </Link>
              ) : null}
              {session?.role === "member" ? (
                <Link href="/guest/account" className="inline-flex h-9 items-center text-sm font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                  {t(locale, "회원정보", "Account")}
                </Link>
              ) : null}
              {session ? (
                <span className="inline-flex h-9 items-center rounded-full border border-cyan-600/45 bg-cyan-500/12 px-3 text-xs font-semibold uppercase tracking-wide text-[#2f8f88] shadow-[0_0_10px_rgba(129,216,208,0.35)] dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-200 dark:shadow-none">
                  {session.role}
                </span>
              ) : null}
              {!session ? (
                <>
                  <Link href="/auth/login" className="inline-flex h-9 items-center text-sm font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                    {t(locale, "로그인", "Login")}
                  </Link>
                  <Link href="/auth/signup" className="inline-flex h-9 items-center text-sm font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                    {t(locale, "회원가입", "Sign up")}
                  </Link>
                </>
              ) : (
                <form action={logoutAction} className="inline-flex h-9 items-center">
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-full border border-zinc-500 bg-zinc-300/92 px-3 text-sm font-semibold text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_6px_rgba(0,0,0,0.05),0_7px_15px_rgba(0,0,0,0.11)] dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-none dark:hover:bg-zinc-700"
                  >
                    {t(locale, "로그아웃", "Logout")}
                  </button>
                </form>
              )}
              <div className="inline-flex h-9 items-center">
                <NavMenuMobile
                  session={session}
                  serverLocale={locale}
                  setLanguageAction={setLanguageAction}
                />
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-500 bg-zinc-300/95 py-4 text-center text-sm text-zinc-800 shadow-[0_-16px_32px_-18px_rgba(129,216,208,0.32)] backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/95 dark:text-zinc-300 dark:shadow-[0_-12px_24px_-20px_rgba(129,216,208,0.3)]">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-3 px-6">
            <p>{t(locale, "© 2026 공인재 신진철의 생존일기", "© 2026 SJC Survival Log")}</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/whflwls"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="인스타그램 바로가기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink-400/40 bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515bd4] text-white shadow-[0_0_20px_rgba(221,42,123,0.62)] transition hover:-translate-y-0.5 hover:brightness-105"
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
              <a
                href="https://www.instagram.com/whflwls"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515bd4] bg-clip-text text-sm font-semibold text-transparent drop-shadow-[0_0_14px_rgba(221,42,123,0.5)] transition hover:brightness-110"
              >
                @whflwls
              </a>
              <a
                href="mailto:sjc5001@hs.ac.kr"
                aria-label="이메일 보내기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-400/40 bg-gradient-to-br from-[#ea4335] via-[#fbbc05] to-[#34a853] text-white shadow-[0_0_20px_rgba(234,67,53,0.5)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m4.2 7.2 7.04 5.62a1.2 1.2 0 0 0 1.52 0L19.8 7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only">이메일 보내기 (sjc5001@hs.ac.kr)</span>
              </a>
              <a
                href="mailto:sjc5001@hs.ac.kr"
                className="bg-gradient-to-br from-[#ea4335] via-[#fbbc05] to-[#34a853] bg-clip-text text-sm font-semibold text-transparent drop-shadow-[0_0_14px_rgba(234,67,53,0.45)] transition hover:brightness-110"
              >
                sjc5001@hs.ac.kr
              </a>
            </div>
          </div>
        </footer>
        <div className="h-24" />
        <BgmPlayer />
      </body>
    </html>
  );
}

