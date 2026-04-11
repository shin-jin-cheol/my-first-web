"use client";

import { useEffect, useMemo, useState } from "react";

function formatNow(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export default function LiveClock() {
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
    <div className="fixed right-4 top-20 z-50 rounded-xl border border-cyan-400/40 bg-zinc-900/65 px-3 py-2 text-xs font-semibold tracking-wide text-cyan-100 shadow-[0_0_20px_rgba(129,216,208,0.25)] backdrop-blur-md">
      {label}
    </div>
  );
}
