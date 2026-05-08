"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const COOLDOWN_MS = 60_000;
const STORAGE_KEY = "signup-send-code-cooldown-until";

type SendCodeButtonProps = {
  idleLabel: string;
  cooldownLabel: string;
  startCooldown: boolean;
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
  idleLabel,
  cooldownLabel,
  startCooldown,
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

  useEffect(() => {
    if (!startCooldown || typeof window === "undefined") {
      return;
    }

    const nextUntil = Date.now() + COOLDOWN_MS;
    const currentUntil = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");

    if (!Number.isNaN(currentUntil) && currentUntil > Date.now()) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, String(nextUntil));
    const syncTimer = window.setTimeout(() => {
      setRemainingSeconds(Math.ceil(COOLDOWN_MS / 1000));
    }, 0);

    return () => {
      window.clearTimeout(syncTimer);
    };
  }, [startCooldown]);

  const isCoolingDown = remainingSeconds > 0;

  return (
    <Button
      type="submit"
      name="intent"
      value="send-code"
      formNoValidate
      disabled={isCoolingDown}
      className="shrink-0 rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-sm font-semibold text-text-sub transition hover:border-[var(--accent-primary)] hover:text-text-base disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-base dark:bg-surface-sub dark:text-text-base dark:hover:border-[var(--accent-primary)]"
    >
      {isCoolingDown ? `${cooldownLabel} (${remainingSeconds}s)` : idleLabel}
    </Button>
  );
}
