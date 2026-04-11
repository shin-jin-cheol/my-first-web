import Link from "next/link";
import { redirect } from "next/navigation";
import { login, setSession } from "@/lib/auth";

async function loginAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const session = await login(id, password);
  if (!session) {
    redirect("/auth/login?error=1");
  }

  await setSession(session);

  if (session.role === "owner") {
    redirect("/admin/members");
  }

  redirect("/guest");
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const showError = params.error === "1";

  return (
    <section className="mx-auto max-w-xl space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-7 shadow-[0_0_24px_rgba(129,216,208,0.14)]">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Auth</p>
        <h1 className="text-3xl font-extrabold text-zinc-100">로그인</h1>
        <p className="text-zinc-300">회원 또는 주인 계정으로 로그인하세요.</p>
      </header>

      {showError ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          아이디 또는 비밀번호가 올바르지 않습니다.
        </p>
      ) : null}

      <form action={loginAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="id" className="text-sm text-zinc-200">아이디</label>
          <input
            id="id"
            name="id"
            required
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-zinc-200">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>

        <button
          type="submit"
          className="rounded-full border border-[#b8ece7] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_16px_rgba(129,216,208,0.5)]"
        >
          로그인
        </button>
      </form>

      <p className="text-sm text-zinc-300">
        회원가입이 필요하면{" "}
        <Link href="/auth/signup" className="text-[#81d8d0] hover:underline">
          회원가입
        </Link>
      </p>
    </section>
  );
}
