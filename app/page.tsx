import Link from "next/link";
import { getLocale, t } from "@/lib/i18n";
import HeroImage from "@/app/components/HeroImage";

export default async function Home() {
  const locale = await getLocale();
  const isEnglish = locale === "en";

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
      <section className="space-y-5">
        <div className="min-h-[128px] space-y-3 md:min-h-[150px]">
          <h1
            className={`font-black text-text-sub dark:text-text-base drop-shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.12)] ${
              isEnglish ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
            }`}
          >
            {t(locale, "Welcome to jincheol.zip-", "real survival story of jincheol.exe")}
          </h1>
          <p className={`max-w-2xl text-text-sub dark:text-text-sub ${isEnglish ? "text-sm" : "text-base"}`}>
            {t(locale, " Real survival story of Jincheol.exe [at Hanshin University]", "Real survival story of Jincheol.exe [at Hanshin University]")}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface-muted/85 dark:border-border-base dark:bg-surface-sub/70 shadow-[0_0_16px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] backdrop-blur">
          <HeroImage />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(from_var(--accent-primary)_r_g_b_/_0.08),transparent_45%),radial-gradient(circle_at_80%_70%,rgb(from_var(--accent-primary)_r_g_b_/_0.05),transparent_40%)]" />
        </div>
      </section>

      <aside className="hidden md:block md:h-full">
        <div className="space-y-4 rounded-2xl border border-border-strong bg-surface-muted/92 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md dark:border-border-base dark:bg-surface-sub/85 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-8px_13px_rgba(0,0,0,0.34),0_7px_16px_rgba(0,0,0,0.28)] lg:h-full">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-sub dark:text-text-sub">
            Quick Menu
          </p>
          <h2 className="text-xl font-bold text-text-base dark:text-text-base">{t(locale, "게시글 바로가기", "Go to Posts")}</h2>
          <p className="text-sm text-text-sub dark:text-text-sub">
            {t(locale, "전체 게시글 목록 화면으로 이동합니다.", "Open the full post list page.")}
          </p>
          <Link
            href="/posts"
            className="inline-flex w-full items-center justify-center rounded-full border border-border-strong bg-surface-strong px-4 py-2.5 text-sm font-semibold text-text-base dark:border-border-base dark:bg-surface-strong dark:text-text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] transition hover:-translate-y-0.5 hover:bg-surface-muted hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)]"
          >
            {t(locale, "게시글 목록 열기", "Open Posts")}
          </Link>
          <Link
            href="/posts/new"
            className="inline-flex w-full items-center justify-center rounded-full border border-border-strong bg-surface-muted px-4 py-2.5 text-sm font-semibold text-text-base transition hover:-translate-y-0.5 hover:bg-surface-muted dark:border-border-sub dark:bg-surface-sub/80 dark:text-text-base dark:hover:bg-surface-strong"
          >
            {t(locale, "새 글 쓰기", "Write New Post")}
          </Link>
          <div className="space-y-2 rounded-xl border border-border-strong bg-surface-muted/90 p-3 text-xs leading-6 text-text-sub dark:border-border-base dark:bg-surface-sub/70 dark:text-text-sub">
            <p><strong>QUICK NOTE</strong></p>
            <p>{t(locale, "오른쪽 메뉴에서 게시글 목록으로 이동하고, 새 글 작성을 바로 시작할 수 있습니다.", "Use the right menu to move to posts and start writing instantly.")}</p>
            <p>{t(locale, "상단 ☰ 에서 라이트 모드 / 다크 모드 선택 가능", "You can choose Light / Dark mode from the ☰ menu at the top.")}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

