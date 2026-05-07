"use client";

import Image from "next/image";

const imageClassName = "h-[460px] w-full object-cover";
const imageAlt = "MZ 감성 무드보드 스타일 배경";

export default function HeroImage() {
  return (
    <>
      <Image
        src="/light.svg"
        alt={imageAlt}
        width={1600}
        height={1000}
        fetchPriority="high"
        className={`${imageClassName} dark:hidden`}
      />
      <Image
        src="/dark.svg"
        alt={imageAlt}
        width={1600}
        height={1000}
        fetchPriority="high"
        className={`hidden ${imageClassName} dark:block`}
      />
    </>
  );
}
