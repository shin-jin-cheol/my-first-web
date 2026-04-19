'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useLocale } from '@/lib/i18n-client';
import type { Session } from '@/lib/auth';

interface NavMenuMobileProps {
  session: Session | null;
  serverLocale: 'ko' | 'en';
  setLanguageAction: (formData: FormData) => Promise<void>;
  logoutAction: () => Promise<void>;
}

export function NavMenuMobile({
  session,
  serverLocale,
  setLanguageAction,
  logoutAction,
}: NavMenuMobileProps) {
  const clientLocale = useLocale();
  const locale = clientLocale || serverLocale;

  const t = (ko: string, en: string) => (locale === 'en' ? en : ko);

  return (
    <details className="group relative">
      <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-zinc-500 bg-zinc-300 text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_8px_rgba(0,0,0,0.08)] transition hover:bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_8px_rgba(0,0,0,0.22)] dark:hover:bg-zinc-700">
        ☰
      </summary>
      <div className="absolute right-0 top-11 z-50 w-56 space-y-2 rounded-2xl border border-zinc-400 bg-zinc-300/95 p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.36)]">

        {session ? (
          <Link
            href="/posts/new"
            className="block rounded-lg border border-[#a8dfd7] bg-[#81d8d0] px-2 py-1.5 text-center font-semibold text-zinc-900 shadow-[0_0_10px_rgba(129,216,208,0.22)]"
          >
            {t('새 글 쓰기', 'Write')}
          </Link>
        ) : null}

        {session?.role === 'owner' ? (
          <Link
            href="/admin/members"
            className="block rounded-lg px-2 py-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {t('회원관리', 'Members')}
          </Link>
        ) : null}
        {session?.role === 'member' ? (
          <Link
            href="/guest/account"
            className="block rounded-lg px-2 py-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {t('회원정보', 'Account')}
          </Link>
        ) : null}

        {session ? (
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-2 py-1.5 font-semibold text-zinc-700 dark:text-zinc-100 transition hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              {t('로그아웃', 'Logout')}
            </button>
          </form>
        ) : null}

        <form action={setLanguageAction} className="inline-flex items-center gap-1 rounded-full border border-zinc-400 bg-zinc-200 p-1 text-xs dark:border-zinc-600 dark:bg-zinc-800/80">
          <button
            type="submit"
            name="lang"
            value="ko"
            className={`rounded-full px-2 py-1 transition ${locale === 'ko' ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-200 dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100'}`}
          >
            KO
          </button>
          <button
            type="submit"
            name="lang"
            value="en"
            className={`rounded-full px-2 py-1 transition ${locale === 'en' ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-200 dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100'}`}
          >
            EN
          </button>
        </form>

        <ThemeToggle />
      </div>
    </details>
  );
}

