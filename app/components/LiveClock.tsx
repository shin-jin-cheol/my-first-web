"use client";

import { useEffect, useMemo, useState } from "react";

type LiveClockProps = {
  className?: string;
};

function formatNow(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export default function LiveClock({ className = "" }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(() => null);

  useEffect(() => {
    const syncClock = () => {
      setNow(new Date());
    };

    const initialTimer = window.setTimeout(syncClock, 0);
    const timer = window.setInterval(syncClock, 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const label = useMemo(() => (now ? formatNow(now) : "---- --:--:--"), [now]);

  return (
    <div className={`rounded-xl border border-border-base bg-surface-strong/85 px-3 py-2 text-xs font-semibold tracking-wide text-text-sub backdrop-blur-md dark:border-accent-border dark:bg-surface-sub/65 dark:text-accent-sub ${className}`}>
      {label}
    </div>
  );
}

