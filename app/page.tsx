import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="space-y-5">
        <h1 className="text-3xl font-black text-zinc-100 drop-shadow-[0_0_16px_rgba(129,216,208,0.45)] md:text-4xl">
          신진철의 홈페이지 입니다
        </h1>
        <p className="max-w-2xl text-zinc-300">
          한신대학교 공공인재빅데이터융합학과 신진철의 생존과정
        </p>

        <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-zinc-900/60 shadow-[0_0_32px_rgba(129,216,208,0.2)] backdrop-blur">
          <Image
            src="/cyber-circuit.svg"
            alt="Y2K 사이버 회로도 배경"
            width={1600}
            height={1000}
            priority
            className="h-[460px] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,216,208,0.2),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(129,216,208,0.12),transparent_40%)]" />
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="min-h-[560px] space-y-4 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-[0_0_28px_rgba(129,216,208,0.15)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Quick Menu
          </p>
          <h2 className="text-xl font-bold text-zinc-100">게시글 바로가기</h2>
          <p className="text-sm text-zinc-300">
            전체 게시글 목록 화면으로 이동합니다.
          </p>
          <Link
            href="/posts"
            className="inline-flex w-full items-center justify-center rounded-full border border-cyan-500/60 bg-gradient-to-r from-zinc-900 via-zinc-800 to-[#2b6661] px-4 py-2.5 text-sm font-semibold text-zinc-100 shadow-[0_0_18px_rgba(129,216,208,0.35)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            게시글 목록 열기
          </Link>
          <Link
            href="/posts/new"
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-500 bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:-translate-y-0.5 hover:bg-zinc-700"
          >
            새 글 쓰기
          </Link>
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 p-3 text-xs leading-6 text-zinc-400">
            QUICK NOTE: 우측 메뉴에서 게시글 목록으로 이동하고, 새 글 작성도 바로 시작할 수 있습니다.
          </div>
        </div>
      </aside>
    </div>
  );
}
