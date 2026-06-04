"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => router.back()}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-sub transition hover:bg-surface-sub hover:text-text-base dark:hover:bg-surface-strong"
    >
      <ArrowLeft aria-hidden="true" size={18} strokeWidth={2.2} />
    </button>
  );
}
