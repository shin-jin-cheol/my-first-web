import type { Metadata } from "next";
import BgmPlayer from "./components/BgmPlayer";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getLocale, t } from "@/lib/i18n";
import { ClientLayout } from "./components/ClientLayout";
import { Header } from "./components/Header";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { getFormString } from "@/lib/form-utils";

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

  async function setLanguageAction(formData: FormData) {
    "use server";

    const nextLang = getFormString(formData, "lang", "ko");
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
      <body className="flex min-h-screen flex-col bg-surface-muted text-text-base shadow-[inset_0_140px_140px_-120px_rgb(from_var(--accent-primary)_r_g_b_/_0.2)] dark:bg-surface dark:text-text-base dark:shadow-[inset_0_120px_120px_-120px_rgb(from_var(--accent-primary)_r_g_b_/_0.22)] pb-24">
        <ClientLayout>
        <Header session={session} locale={locale} setLanguageAction={setLanguageAction} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-strong bg-surface-muted/95 py-4 text-center text-sm text-text-base shadow-[0_-8px_16px_-8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] backdrop-blur dark:border-border-base dark:bg-surface/95 dark:text-text-muted dark:shadow-[0_-6px_12px_-12px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)]">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-3 px-6">
            <p>{t(locale, "© 2026 공인재 신진철의 생존일기", "© 2026 SJC Survival Log")}</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/whflwls"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="인스타그램 바로가기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand bg-gradient-to-br from-[var(--instagram-start)] via-[var(--instagram-mid)] to-[var(--instagram-end)] text-highlight shadow-[0_0_12px_rgb(from_var(--instagram-mid)_r_g_b_/_0.18)] transition hover:-translate-y-0.5 hover:brightness-105"
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
                className="bg-gradient-to-br from-[var(--instagram-start)] via-[var(--instagram-mid)] to-[var(--instagram-end)] bg-clip-text text-sm font-semibold text-transparent drop-shadow-[0_0_8px_rgb(from_var(--instagram-mid)_r_g_b_/_0.12)] transition hover:brightness-110"
              >
                @whflwls
              </a>
              <a
                href="mailto:sjc5001@hs.ac.kr"
                aria-label="이메일 보내기"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-danger-border bg-gradient-to-br from-[var(--mail-start)] via-[var(--mail-mid)] to-[var(--mail-end)] text-highlight shadow-[0_0_12px_rgb(from_var(--mail-start)_r_g_b_/_0.12)] transition hover:-translate-y-0.5 hover:brightness-105"
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
                className="bg-gradient-to-br from-[var(--mail-start)] via-[var(--mail-mid)] to-[var(--mail-end)] bg-clip-text text-sm font-semibold text-transparent drop-shadow-[0_0_8px_rgb(from_var(--mail-start)_r_g_b_/_0.12)] transition hover:brightness-110"
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

