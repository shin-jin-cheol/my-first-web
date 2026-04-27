"use client";

import { useEffect, useState } from "react";

const COOLDOWN_MS = 60_000;
const STORAGE_KEY = "signup-send-code-cooldown-until";

type SendCodeButtonProps = {
  formAction: (formData: FormData) => void | Promise<void>;
  idleLabel: string;
  cooldownLabel: string;
};

function getRemainingSeconds() {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const until = raw ? Number(raw) : 0;

  if (!until || Number.isNaN(until)) {
    return 0;
  }

  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

export default function SendCodeButton({
  formAction,
  idleLabel,
  cooldownLabel,
}: SendCodeButtonProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds(getRemainingSeconds());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const isCoolingDown = remainingSeconds > 0;

  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate
      disabled={isCoolingDown}
      onClick={() => {
        if (isCoolingDown || typeof window === "undefined") {
          return;
        }

        window.localStorage.setItem(STORAGE_KEY, String(Date.now() + COOLDOWN_MS));
        setRemainingSeconds(Math.ceil(COOLDOWN_MS / 1000));
      }}
      className="shrink-0 rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-[#81d8d0] hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-[#81d8d0]"
    >
      {isCoolingDown ? `${cooldownLabel} (${remainingSeconds}s)` : idleLabel}
    </button>
  );
}
