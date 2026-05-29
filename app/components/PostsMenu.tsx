"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n-client";
import { useDetailsClose } from "./useDetailsClose";

type PostsMenuProps = {
  serverLocale: "ko" | "en";
};

export function PostsMenu({ serverLocale }: PostsMenuProps) {
  const detailsRef = useDetailsClose();
  const clientLocale = useLocale();
  const locale = clientLocale || serverLocale;
  const t = (ko: string, en: string) => (locale === "en" ? en : ko);

  const closeMenuOnAction = (event: React.MouseEvent<HTMLDivElement>) => {
    const details = detailsRef.current;
    if (!details?.open) {
      return;
    }

    const target = event.target;
    if (target instanceof Element && target.closest("a")) {
      details.open = false;
    }
  };

  return (
    <details ref={detailsRef} className="group relative hidden h-9 shrink-0 items-center align-middle lg:inline-flex">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-border-base bg-surface-muted px-3 text-sm font-semibold text-text-sub shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_8px_rgba(0,0,0,0.08)] transition marker:hidden hover:bg-surface-strong hover:text-text-base [&::-webkit-details-marker]:hidden dark:border-border-base dark:bg-surface-strong dark:text-text-sub dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_8px_rgba(0,0,0,0.22)] dark:hover:bg-surface-sub dark:hover:text-text-base">
        <span>{t("게시글", "Posts")}</span>
      </summary>
      <div
        onClick={closeMenuOnAction}
        className="absolute left-0 top-11 z-50 w-44 space-y-2 rounded-2xl border border-border-base bg-surface-muted/95 p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur dark:border-border-base dark:bg-surface-sub/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.36)]"
      >
        <Link
          href="/posts"
          className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
        >
          {t("블로그", "Blog")}
        </Link>
        <Link
          href="/guest"
          className="block rounded-lg px-2 py-1.5 text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base"
        >
          {t("게스트 게시판", "Guest Board")}
        </Link>
      </div>
    </details>
  );
}
