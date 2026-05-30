'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useDetailsClose } from './useDetailsClose';
import { Button } from '@/components/ui/button';
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
  const detailsRef = useDetailsClose();
  const clientLocale = useLocale();
  const locale = clientLocale || serverLocale;

  const t = (ko: string, en: string) => (locale === 'en' ? en : ko);
  const writeHref = session?.role === 'owner' ? '/posts/new' : '/guest/new';
  const writeLabel =
    session?.role === 'owner' ? t('새 글 쓰기', 'Write') : t('게스트 글 쓰기', 'Write Guest Post');

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
        className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center p-0 text-text-sub transition marker:hidden hover:text-text-base [&::-webkit-details-marker]:hidden"
      >
        <Menu aria-hidden="true" size={18} strokeWidth={2.2} />
        <span className="sr-only">{t('메뉴 열기', 'Open menu')}</span>
      </summary>
      <div
        onClick={closeMenuOnAction}
        className="absolute right-0 top-11 z-50 w-56 space-y-2 rounded-2xl border border-border-base bg-surface-muted/95 p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur dark:border-border-base dark:bg-surface-sub/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.36)]"
      >
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
          <Link
            href="/auth/login"
            className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
          >
            {t('로그인', 'Login')}
          </Link>
        ) : null}

        <div className="my-1 h-px bg-border-base/70 dark:bg-border-sub" />

        {session ? (
          <Link
            href={writeHref}
            className="block px-2 py-1.5 font-semibold text-text-sub transition hover:text-text-base hover:underline"
          >
            {writeLabel}
          </Link>
        ) : null}

        {session ? (
          <Link
            href={`/profile/${encodeURIComponent(session.userId)}`}
            className="block rounded-lg px-2 py-1.5 text-text-muted transition hover:bg-surface-sub hover:text-text-sub dark:text-text-subtle dark:hover:bg-surface-strong dark:hover:text-text-base"
          >
            {t('내 프로필', 'My Profile')}
          </Link>
        ) : null}

        {session ? (
          <Link
            href="/friends"
            className="block rounded-lg px-2 py-1.5 text-text-muted transition hover:bg-surface-sub hover:text-text-sub dark:text-text-subtle dark:hover:bg-surface-strong dark:hover:text-text-base"
          >
            {t('친구 / 채팅', 'Friends / Chat')}
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

        <form action={setLanguageAction} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background-secondary)] p-1 text-xs">
          <Button
            type="submit"
            variant="ghost"
            name="lang"
            value="ko"
            aria-label={t('한국어 선택', 'Select Korean')}
            className={`rounded-full bg-transparent px-3 py-1 transition hover:bg-transparent ${locale === 'ko' ? 'bg-[var(--color-background-primary)] text-text-base shadow-[0_1px_4px_rgb(from_var(--color-foreground)_r_g_b_/_0.14)] hover:bg-[var(--color-background-primary)]' : 'text-text-sub hover:text-text-base'}`}
          >
            한국어
          </Button>
          <Button
            type="submit"
            variant="ghost"
            name="lang"
            value="en"
            aria-label={t('영어 선택', 'Select English')}
            className={`rounded-full bg-transparent px-3 py-1 transition hover:bg-transparent ${locale === 'en' ? 'bg-[var(--color-background-primary)] text-text-base shadow-[0_1px_4px_rgb(from_var(--color-foreground)_r_g_b_/_0.14)] hover:bg-[var(--color-background-primary)]' : 'text-text-sub hover:text-text-base'}`}
          >
            English
          </Button>
        </form>

        <ThemeToggle />
      </div>
    </details>
  );
}

