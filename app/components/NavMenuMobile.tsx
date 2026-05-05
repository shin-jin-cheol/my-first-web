'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useEffect, useRef } from 'react';
import { useLocale } from '@/lib/i18n-client';
import type { Session } from '@/lib/auth';

interface NavMenuMobileProps {
  session: Session | null;
  serverLocale: 'ko' | 'en';
  setLanguageAction: (formData: FormData) => Promise<void>;
}

export function NavMenuMobile({
  session,
  serverLocale,
  setLanguageAction,
}: NavMenuMobileProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const clientLocale = useLocale();
  const locale = clientLocale || serverLocale;

  const t = (ko: string, en: string) => (locale === 'en' ? en : ko);
  const writeHref = session?.role === 'owner' ? '/posts/new' : '/guest/new';
  const writeLabel =
    session?.role === 'owner' ? t('새 글 쓰기', 'Write') : t('게스트 글 쓰기', 'Write Guest Post');

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const details = detailsRef.current;
      if (!details?.open) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!details.contains(target)) {
        details.open = false;
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, []);

  const closeMenuOnAction = (event: React.MouseEvent<HTMLDivElement>) => {
    const details = detailsRef.current;
    if (!details?.open) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('a,button')) {
      details.open = false;
    }
  };

  return (
    <details ref={detailsRef} className="group relative inline-flex h-9 shrink-0 items-center align-middle">
      <summary
        aria-label={t('메뉴 열기', 'Open menu')}
        className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-border-base bg-surface-muted p-0 text-text-sub shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_8px_rgba(0,0,0,0.08)] transition marker:hidden hover:bg-surface-strong [&::-webkit-details-marker]:hidden dark:border-border-base dark:bg-surface-strong dark:text-text-sub dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_8px_rgba(0,0,0,0.22)] dark:hover:bg-surface-sub"
      >
        <Menu aria-hidden="true" size={18} strokeWidth={2.2} />
        <span className="sr-only">{t('메뉴 열기', 'Open menu')}</span>
      </summary>
      <div
        onClick={closeMenuOnAction}
        className="absolute right-0 top-11 z-50 w-56 space-y-2 rounded-2xl border border-border-base bg-surface-muted/95 p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur dark:border-border-base dark:bg-surface-sub/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.36)]"
      >
        <Link
          href="/"
          className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
        >
          {t('홈', 'Home')}
        </Link>
        <Link
          href="/posts"
          className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
        >
          {t('블로그', 'Blog')}
        </Link>
        <Link
          href="/guest"
          className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
        >
          {t('게스트 게시판', 'Guest Board')}
        </Link>

        {!session ? (
          <>
            <Link
              href="/auth/login"
              className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
            >
              {t('로그인', 'Login')}
            </Link>
            <Link
              href="/auth/signup"
              className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
            >
              {t('회원가입', 'Sign up')}
            </Link>
          </>
        ) : null}

        <div className="my-1 h-px bg-border-base/70 dark:bg-border-sub" />

        {session ? (
          <Link
            href={writeHref}
            className="block rounded-lg border border-[#a8dfd7] bg-[#81d8d0] px-2 py-1.5 text-center font-semibold text-text-base shadow-[0_0_6px_rgba(129,216,208,0.08)]"
          >
            {writeLabel}
          </Link>
        ) : null}

        {session?.role === 'owner' ? (
          <Link
            href="/admin/members"
            className="block rounded-lg px-2 py-1.5 text-text-muted transition hover:bg-surface-sub hover:text-text-sub dark:text-text-subtle dark:hover:bg-surface-strong dark:hover:text-text-base"
          >
            {t('회원관리', 'Members')}
          </Link>
        ) : null}
        {session?.role === 'member' ? (
          <Link
            href="/guest/account"
            className="block rounded-lg px-2 py-1.5 text-text-muted transition hover:bg-surface-sub hover:text-text-sub dark:text-text-subtle dark:hover:bg-surface-strong dark:hover:text-text-base"
          >
            {t('회원정보', 'Account')}
          </Link>
        ) : null}

        <form action={setLanguageAction} className="inline-flex items-center gap-1 rounded-full border border-border-base bg-surface-strong p-1 text-xs dark:border-border-base dark:bg-surface-strong/80">
          <button
            type="submit"
            name="lang"
            value="ko"
            aria-label={t('한국어 선택', 'Select Korean')}
            className={`rounded-full px-2 py-1 transition ${locale === 'ko' ? 'bg-surface-strong text-text-sub dark:bg-surface-strong dark:text-text-base' : 'text-text-muted hover:text-text-sub dark:text-text-subtle dark:hover:text-text-base'}`}
          >
            KO
          </button>
          <button
            type="submit"
            name="lang"
            value="en"
            aria-label={t('영어 선택', 'Select English')}
            className={`rounded-full px-2 py-1 transition ${locale === 'en' ? 'bg-surface-strong text-text-sub dark:bg-surface-strong dark:text-text-base' : 'text-text-muted hover:text-text-sub dark:text-text-subtle dark:hover:text-text-base'}`}
          >
            EN
          </button>
        </form>

        <ThemeToggle />
      </div>
    </details>
  );
}

