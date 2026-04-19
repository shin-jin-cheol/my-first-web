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
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const label = useMemo(() => (now ? formatNow(now) : "---- --:--:--"), [now]);

  return (
    <div className={`rounded-xl border border-zinc-300 bg-zinc-200/85 px-3 py-2 text-xs font-semibold tracking-wide text-zinc-700 backdrop-blur-md dark:border-cyan-400/40 dark:bg-zinc-900/65 dark:text-cyan-100 ${className}`}>
      {label}
    </div>
  );
}

