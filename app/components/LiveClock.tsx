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
    // Hydration 후 클라이언트 시계 상태를 초기화하기 위해 필요합니다.
    // SSR 단계에서는 눈에 보이는 현재 시간이 없으므로, 클라이언트가 마운트된
    // 이후에만 실제 시간을 표시하도록 상태를 설정합니다.
    setNow(new Date());

    const timer = window.setInterval(() => {
      // 초 단위 갱신은 클라이언트 타이머로만 의미가 있으므로
      // 이 이펙트의 콜백 내부에서 상태를 갱신합니다.
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

