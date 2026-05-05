import type { Metadata } from "next";
import Link from "next/link";
import BgmPlayer from "./components/BgmPlayer";
import { clearSession, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getLocale, t } from "@/lib/i18n";
import { ClientLayout } from "./components/ClientLayout";
import { NavMenuMobile } from "./components/NavMenuMobile";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

function getSafeRedirectPath(referer: string | null, requestHeaders: Headers) {
  if (!referer) {
    return "/";
  }

  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) {
    return "/";
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  try {
    const refererUrl = new URL(referer);
    const currentOrigin = `${protocol}://${host}`;

    return refererUrl.origin === currentOrigin ? referer : "/";
  } catch {
    return "/";
  }
}

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
    const requestHeaders = await headers();
    const store = await (await import("next/headers")).cookies();
    store.set("lang", nextLang === "en" ? "en" : "ko", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    const referer = requestHeaders.get("referer");
    redirect(getSafeRedirectPath(referer, requestHeaders));
  }

  return (
    <html lang="ko" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-surface-muted text-text-base shadow-[inset_0_140px_140px_-120px_rgba(129,216,208,0.2)] dark:bg-surface dark:text-text-base dark:shadow-[inset_0_120px_120px_-120px_rgba(129,216,208,0.22)] pb-24">
        <ClientLayout>
        <nav className="border-b border-border-strong bg-surface-muted text-text-base shadow-[0_0_16px_rgba(129,216,208,0.08)] dark:border-border-base dark:bg-surface dark:text-text-base dark:shadow-[0_0_12px_rgba(129,216,208,0.05)]">
          <div className="mx-auto w-full max-w-4xl px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center justify-between gap-3 md:hidden">
              <span className="inline-flex h-9 min-w-0 flex-1 items-center truncate rounded-full border border-border-strong bg-surface-muted/92 px-3 text-sm font-extrabold tracking-[0.01em] text-text-base drop-shadow-[0_0_6px_rgba(129,216,208,0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md dark:border-border-sub dark:bg-surface-sub/70 dark:text-text-base dark:drop-shadow-none dark:shadow-[0_0_8px_rgba(129,216,208,0.08)]">
                공인재 신진철의 생존일기
              </span>
              <div className="flex h-9 shrink-0 items-center gap-2">
                {session ? (
                  <span className="inline-flex h-9 items-center rounded-full border border-accent-border bg-accent-soft px-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#2f8f88] shadow-[0_0_6px_rgba(129,216,208,0.08)] dark:border-accent-border dark:bg-accent-soft dark:text-accent-sub dark:shadow-none">
                    {session.role}
                  </span>
                ) : null}
                {!session ? (
                  <Link href="/auth/login" className="inline-flex h-9 items-center rounded-full border border-border-strong bg-surface-muted/92 px-3 text-xs font-semibold text-text-sub shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 dark:border-border-strong dark:bg-surface-strong dark:text-text-base dark:shadow-none dark:hover:bg-surface-sub">
                    {t(locale, "로그인", "Login")}
                  </Link>
                ) : (
                  <form action={logoutAction} className="inline-flex h-9 items-center">
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-full border border-border-strong bg-surface-muted/92 px-3 text-xs font-semibold text-text-sub shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 dark:border-border-strong dark:bg-surface-strong dark:text-text-base dark:shadow-none dark:hover:bg-surface-sub"
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

            <div className="hidden min-w-0 items-center gap-3 md:flex">
              <span className="inline-flex h-9 min-w-0 flex-1 items-center truncate rounded-full border border-border-strong bg-surface-muted/92 px-3 text-base font-extrabold tracking-[0.01em] text-text-base drop-shadow-[0_0_6px_rgba(129,216,208,0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md dark:border-border-sub dark:bg-surface-sub/70 dark:text-text-base dark:drop-shadow-none dark:shadow-[0_0_8px_rgba(129,216,208,0.08)] md:text-lg lg:max-w-[15rem] lg:flex-none">
                공인재 신진철의 생존일기
              </span>
              <Link href="/" className="hidden h-9 shrink-0 items-center text-sm font-medium text-text-sub transition hover:text-text-base hover:drop-shadow-[0_0_6px_rgba(129,216,208,0.18)] dark:text-text-muted dark:hover:text-highlight dark:hover:drop-shadow-[0_0_8px_rgba(129,216,208,0.18)] lg:inline-flex">
                {t(locale, "홈", "Home")}
              </Link>
              <Link href="/posts" className="hidden h-9 shrink-0 items-center text-sm font-medium text-text-sub transition hover:text-text-base hover:drop-shadow-[0_0_6px_rgba(129,216,208,0.18)] dark:text-text-muted dark:hover:text-highlight dark:hover:drop-shadow-[0_0_8px_rgba(129,216,208,0.18)] lg:inline-flex">
                {t(locale, "블로그", "Blog")}
              </Link>
              <Link href="/guest" className="hidden h-9 shrink-0 items-center text-sm font-medium text-text-sub transition hover:text-text-base hover:drop-shadow-[0_0_6px_rgba(129,216,208,0.18)] dark:text-text-muted dark:hover:text-highlight dark:hover:drop-shadow-[0_0_8px_rgba(129,216,208,0.18)] lg:inline-flex">
                {t(locale, "게스트 게시판", "Guest Board")}
              </Link>
              {session ? (
                <Link
                  href={writeHref}
                  className="hidden h-9 shrink-0 items-center rounded-full border border-[#74cfc6] bg-[#81d8d0] px-3 text-sm font-semibold text-text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_6px_rgba(0,0,0,0.05),0_0_12px_rgba(129,216,208,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-3px_6px_rgba(0,0,0,0.05),0_0_16px_rgba(129,216,208,0.25)] lg:inline-flex"
                >
                  {writeLabel}
                </Link>
              ) : null}
              {session?.role === "owner" ? (
                <Link href="/admin/members" className="hidden h-9 shrink-0 items-center text-sm font-medium text-text-sub transition hover:text-text-base dark:text-text-muted dark:hover:text-highlight xl:inline-flex">
                  {t(locale, "회원관리", "Members")}
                </Link>
              ) : null}
              {session?.role === "member" ? (
                <Link href="/guest/account" className="hidden h-9 shrink-0 items-center text-sm font-medium text-text-sub transition hover:text-text-base dark:text-text-muted dark:hover:text-highlight xl:inline-flex">
                  {t(locale, "회원정보", "Account")}
                </Link>
              ) : null}
              {session ? (
                <span className="hidden h-9 shrink-0 items-center rounded-full border border-accent-border bg-accent-soft px-3 text-xs font-semibold uppercase tracking-wide text-[#2f8f88] shadow-[0_0_6px_rgba(129,216,208,0.08)] dark:border-accent-border dark:bg-accent-soft dark:text-accent-sub dark:shadow-none xl:inline-flex">
                  {session.role}
                </span>
              ) : null}
              <div className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap">
                {!session ? (
                  <>
                    <Link href="/auth/login" className="inline-flex h-9 items-center text-sm font-medium text-text-sub transition hover:text-text-base dark:text-text-muted dark:hover:text-highlight">
                      {t(locale, "로그인", "Login")}
                    </Link>
                    <Link href="/auth/signup" className="inline-flex h-9 items-center text-sm font-medium text-text-sub transition hover:text-text-base dark:text-text-muted dark:hover:text-highlight">
                      {t(locale, "회원가입", "Sign up")}
                    </Link>
                  </>
                ) : (
                  <form action={logoutAction} className="inline-flex h-9 items-center">
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-full border border-border-strong bg-surface-muted/92 px-3 text-sm font-semibold text-text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_6px_rgba(0,0,0,0.05),0_7px_15px_rgba(0,0,0,0.11)] dark:border-border-strong dark:bg-surface-strong dark:text-text-base dark:shadow-none dark:hover:bg-surface-sub"
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
          </div>
        </nav>
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-strong bg-surface-muted/95 py-4 text-center text-sm text-text-base shadow-[0_-8px_16px_-8px_rgba(129,216,208,0.08)] backdrop-blur dark:border-border-base dark:bg-surface/95 dark:text-text-muted dark:shadow-[0_-6px_12px_-12px_rgba(129,216,208,0.08)]">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-3 px-6">
            <p>{t(locale, "© 2026 공인재 신진철의 생존일기", "© 2026 SJC Survival Log")}</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/whflwls"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="인스타그램 바로가기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515bd4] text-highlight shadow-[0_0_12px_rgba(221,42,123,0.18)] transition hover:-translate-y-0.5 hover:brightness-105"
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
                className="bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515bd4] bg-clip-text text-sm font-semibold text-transparent drop-shadow-[0_0_8px_rgba(221,42,123,0.12)] transition hover:brightness-110"
              >
                @whflwls
              </a>
              <a
                href="mailto:sjc5001@hs.ac.kr"
                aria-label="이메일 보내기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-danger-border bg-gradient-to-br from-[#ea4335] via-[#fbbc05] to-[#34a853] text-highlight shadow-[0_0_12px_rgba(234,67,53,0.12)] transition hover:-translate-y-0.5 hover:brightness-105"
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
                className="bg-gradient-to-br from-[#ea4335] via-[#fbbc05] to-[#34a853] bg-clip-text text-sm font-semibold text-transparent drop-shadow-[0_0_8px_rgba(234,67,53,0.12)] transition hover:brightness-110"
              >
                sjc5001@hs.ac.kr
              </a>
            </div>
          </div>
        </footer>
        <div className="h-24" />
        <BgmPlayer />
        </ClientLayout>
      </body>
    </html>
  );
}

