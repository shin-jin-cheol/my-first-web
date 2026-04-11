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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const label = useMemo(() => formatNow(now), [now]);

  return (
    <div className={`rounded-xl border border-cyan-400/40 bg-zinc-900/65 px-3 py-2 text-xs font-semibold tracking-wide text-cyan-100 backdrop-blur-md ${className}`}>
      {label}
    </div>
  );
}
