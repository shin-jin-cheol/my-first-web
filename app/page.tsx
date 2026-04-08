export default function Home() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-amber-200 bg-white/80 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-500">Welcome</p>
        <h1 className="mt-3 text-4xl font-extrabold text-slate-800">공인재 신진철의 생존일기</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          개발 기록과 배운 내용을 가볍게 정리하고 공유하는 공간입니다. 오늘의 학습 포인트를
          짧고 선명하게 남겨 보세요.
        </p>
      </div>
    </section>
  );
}
