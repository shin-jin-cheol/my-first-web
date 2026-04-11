import Link from "next/link";
import { redirect } from "next/navigation";
import { login, setSession } from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";

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
  searchParams: Promise<{ error?: string; withdraw?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const showError = params.error === "1";
  const showWithdrawMessage = params.withdraw === "1";

  return (
    <section className="mx-auto max-w-xl space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-7 shadow-[0_0_24px_rgba(129,216,208,0.14)]">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Auth</p>
        <h1 className="text-3xl font-extrabold text-zinc-100">{t(locale, "로그인", "Login")}</h1>
        <p className="text-zinc-300">{t(locale, "회원 또는 주인 계정으로 로그인하세요.", "Login with a member or owner account.")}</p>
      </header>

      {showError ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {t(locale, "아이디 또는 비밀번호가 올바르지 않습니다.", "Invalid ID or password.")}
        </p>
      ) : null}

      {showWithdrawMessage ? (
        <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
          {t(locale, "회원 탈퇴가 완료되었습니다.", "Your account has been deleted.")}
        </p>
      ) : null}

      <form action={loginAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="id" className="text-sm text-zinc-200">{t(locale, "아이디", "ID")}</label>
          <input
            id="id"
            name="id"
            required
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-zinc-200">{t(locale, "비밀번호", "Password")}</label>
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
          {t(locale, "로그인", "Login")}
        </button>
      </form>

      <p className="text-sm text-zinc-300">
        {t(locale, "회원가입이 필요하면", "Need an account?")} {" "}
        <Link href="/auth/signup" className="text-[#81d8d0] hover:underline">
          {t(locale, "회원가입", "Sign up")}
        </Link>
      </p>
    </section>
  );
}
