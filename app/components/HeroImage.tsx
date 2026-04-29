"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export default function HeroImage() {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      setResolvedTheme("light");
      return;
    }

    if (theme === "dark") {
      setResolvedTheme("dark");
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);

    return () => mediaQuery.removeEventListener("change", syncTheme);
  }, [theme]);

  // 초기 로드 시에는 서버에서의 기본값(다크)을 표시
  if (!mounted) {
    return (
      <Image
        src="/dark.svg"
        alt="MZ 감성 무드보드 스타일 배경"
        width={1600}
        height={1000}
        priority
        className="h-[460px] w-full object-cover"
      />
    );
  }

  const imageSrc = resolvedTheme === "dark" ? "/dark.svg" : "/light.svg";

  return (
    <Image
      src={imageSrc}
      alt="MZ 감성 무드보드 스타일 배경"
      width={1600}
      height={1000}
      priority
      className="h-[460px] w-full object-cover"
    />
  );
}
