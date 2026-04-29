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
            className={`font-black text-zinc-800 dark:text-zinc-100 drop-shadow-[0_0_16px_rgba(129,216,208,0.45)] ${
              isEnglish ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
            }`}
          >
            {t(locale, "Welcome to jincheol.zip-", "real survival story of jincheol.exe")}
          </h1>
          <p className={`max-w-2xl text-zinc-700 dark:text-zinc-200 ${isEnglish ? "text-sm" : "text-base"}`}>
            {t(locale, " Real survival story of Jincheol.exe [at Hanshin University]", "Real survival story of Jincheol.exe [at Hanshin University]")}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-500 bg-zinc-400/85 dark:border-zinc-600 dark:bg-zinc-900/70 shadow-[0_0_32px_rgba(129,216,208,0.2)] backdrop-blur">
          <HeroImage />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,216,208,0.2),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(129,216,208,0.12),transparent_40%)]" />
        </div>
      </section>

      <aside className="hidden md:block md:h-full">
        <div className="space-y-4 rounded-2xl border border-zinc-500 bg-zinc-300/92 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-3px_6px_rgba(0,0,0,0.04),0_5px_12px_rgba(0,0,0,0.09)] backdrop-blur-md dark:border-zinc-600 dark:bg-zinc-900/85 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-8px_13px_rgba(0,0,0,0.34),0_7px_16px_rgba(0,0,0,0.28)] lg:h-full">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-800 dark:text-zinc-300">
            Quick Menu
          </p>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t(locale, "게시글 바로가기", "Go to Posts")}</h2>
          <p className="text-sm text-zinc-800 dark:text-zinc-200">
            {t(locale, "전체 게시글 목록 화면으로 이동합니다.", "Open the full post list page.")}
          </p>
          <Link
            href="/posts"
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-600 bg-zinc-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_13px_rgba(129,216,208,0.26)] transition hover:-translate-y-0.5 hover:bg-zinc-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_0_15px_rgba(129,216,208,0.34)]"
          >
            {t(locale, "게시글 목록 열기", "Open Posts")}
          </Link>
          <Link
            href="/posts/new"
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-600 bg-zinc-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:-translate-y-0.5 hover:bg-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {t(locale, "새 글 쓰기", "Write New Post")}
          </Link>
          <div className="space-y-2 rounded-xl border border-zinc-500 bg-zinc-300/90 p-3 text-xs leading-6 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-300">
            <p><strong>QUICK NOTE</strong></p>
            <p>{t(locale, "오른쪽 메뉴에서 게시글 목록으로 이동하고, 새 글 작성을 바로 시작할 수 있습니다.", "Use the right menu to move to posts and start writing instantly.")}</p>
            <p>{t(locale, "상단 ☰ 에서 라이트 모드 / 다크 모드 선택 가능", "You can choose Light / Dark mode from the ☰ menu at the top.")}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

