import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth";
import { getAvatarColorClass, getAvatarText } from "@/lib/avatar-utils";
import { t, type Locale } from "@/lib/i18n";
import { NavMenuMobile } from "./NavMenuMobile";
import { PostsMenu } from "./PostsMenu";

const siteTitle = "\uacf5\uc778\uc7ac \uc2e0\uc9c4\ucca0\uc758 \uc0dd\uc874\uc77c\uae30";

type HeaderProps = {
  session: Session | null;
  locale: Locale;
  setLanguageAction: (formData: FormData) => Promise<void>;
};

export function Header({ session, locale, setLanguageAction }: HeaderProps) {
  const writeHref = session?.role === "owner" ? "/posts/new" : "/guest/new";
  const writeLabel =
    session?.role === "owner"
      ? t(locale, "\uc0c8 \uae00 \uc4f0\uae30", "Write")
      : t(locale, "\uc0c8 \uae00 \uc4f0\uae30", "Write");
  const profileName = session?.userName || session?.userId || "";
  const profileHref = session ? `/profile/${encodeURIComponent(session.userId)}` : "";
  const profileAvatarText = getAvatarText(profileName);
  const profileAvatarColor = getAvatarColorClass(profileName);

  return (
    <nav className="border-b border-border-strong bg-surface-muted text-text-base shadow-[0_0_16px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] dark:border-border-base dark:bg-surface dark:text-text-base dark:shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <Link href="/" className="inline-flex h-9 min-w-0 flex-1 items-center truncate rounded-full border border-border-strong bg-surface-muted/92 px-3 text-sm font-extrabold tracking-[0.01em] text-text-base drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md transition hover:brightness-105 dark:border-border-sub dark:bg-surface-sub/70 dark:text-text-base dark:drop-shadow-none dark:shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)]">
            {siteTitle}
          </Link>
          <div className="flex h-9 shrink-0 items-center gap-2">
            {session ? (
              <Link
                href={profileHref}
                aria-label={t(locale, "\ud504\ub85c\ud544", "Profile")}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-base text-xs font-bold text-[var(--surface)] shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] transition hover:brightness-105"
                style={{ backgroundColor: profileAvatarColor }}
              >
                {profileAvatarText}
              </Link>
            ) : null}
            {!session ? (
              <Link href="/auth/login" className="inline-flex h-9 items-center rounded-full border border-border-strong bg-surface-muted/92 px-3 text-xs font-semibold text-text-sub shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 dark:border-border-strong dark:bg-surface-strong dark:text-text-base dark:shadow-none dark:hover:bg-surface-sub">
                {t(locale, "\ub85c\uadf8\uc778", "Login")}
              </Link>
            ) : (
              <form action={logoutAction} className="inline-flex h-9 items-center">
                <Button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full border border-border-strong bg-surface-muted/92 px-3 text-xs font-semibold text-text-sub shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 dark:border-border-strong dark:bg-surface-strong dark:text-text-base dark:shadow-none dark:hover:bg-surface-sub"
                >
                  {t(locale, "\ub85c\uadf8\uc544\uc6c3", "Logout")}
                </Button>
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
          <Link href="/" className="inline-flex h-9 min-w-0 flex-1 items-center truncate rounded-full border border-border-strong bg-surface-muted/92 px-3 text-base font-extrabold tracking-[0.01em] text-text-base drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md transition hover:brightness-105 dark:border-border-sub dark:bg-surface-sub/70 dark:text-text-base dark:drop-shadow-none dark:shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] md:text-lg lg:max-w-[15rem] lg:flex-none">
            {siteTitle}
          </Link>
          <Link href="/" className="hidden h-9 shrink-0 items-center text-sm font-medium text-text-sub transition hover:text-text-base hover:drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.18)] dark:text-text-muted dark:hover:text-highlight dark:hover:drop-shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.18)] lg:inline-flex">
            {t(locale, "\ud648", "Home")}
          </Link>
          <PostsMenu serverLocale={locale} />
          {session ? (
            <Link
              href={writeHref}
              className="hidden h-9 shrink-0 items-center rounded-full border border-[var(--accent-mid)] bg-[var(--accent-primary)] px-3 text-sm font-semibold text-text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_6px_rgba(0,0,0,0.05),0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.18)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-3px_6px_rgba(0,0,0,0.05),0_0_16px_rgb(from_var(--accent-primary)_r_g_b_/_0.25)] lg:inline-flex"
            >
              {writeLabel}
            </Link>
          ) : null}
          <div className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap">
            {!session ? (
              <Link href="/auth/login" className="inline-flex h-9 items-center text-sm font-medium text-text-sub transition hover:text-text-base dark:text-text-muted dark:hover:text-highlight">
                {t(locale, "\ub85c\uadf8\uc778", "Login")}
              </Link>
            ) : (
              <form action={logoutAction} className="inline-flex h-9 items-center">
                <Button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full border border-border-strong bg-surface-muted/92 px-3 text-sm font-semibold text-text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] transition hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_6px_rgba(0,0,0,0.05),0_7px_15px_rgba(0,0,0,0.11)] dark:border-border-strong dark:bg-surface-strong dark:text-text-base dark:shadow-none dark:hover:bg-surface-sub"
                >
                  {t(locale, "\ub85c\uadf8\uc544\uc6c3", "Logout")}
                </Button>
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
  );
}
