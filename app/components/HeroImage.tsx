"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroImage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 초기 테마 감지
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // 테마 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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

  const imageSrc = theme === "dark" ? "/dark.svg" : "/light.svg";

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
