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
  searchParams: Promise<{ error?: string; withdraw?: string; signup?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const showError = params.error === "1";
  const showWithdrawMessage = params.withdraw === "1";
  const showSignupMessage = params.signup === "1";

  return (
    <section className="mx-auto max-w-xl space-y-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-7 shadow-[0_0_24px_rgba(129,216,208,0.14)]">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Auth</p>
        <h1 className="text-3xl font-extrabold text-zinc-700 dark:text-zinc-100">{t(locale, "로그인", "Login")}</h1>
        <p className="text-zinc-500 dark:text-zinc-300">{t(locale, "로그인 후 이용 가능합니다.", "Login required to continue.")}</p>
      </header>

      {showError ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {t(locale, "아이디 또는 비밀번호가 올바르지 않습니다.", "Invalid ID or password.")}
        </p>
      ) : null}

      {showWithdrawMessage ? (
        <p className="rounded-xl border border-cyan-600/40 bg-cyan-500/10 px-4 py-2 text-sm text-[#2f8f88] shadow-[0_0_12px_rgba(129,216,208,0.24)] dark:text-cyan-200 dark:shadow-none">
          {t(locale, "회원 탈퇴가 완료되었습니다.", "Your account has been deleted.")}
        </p>
      ) : null}

      {showSignupMessage ? (
        <p className="rounded-xl border border-cyan-600/40 bg-cyan-500/10 px-4 py-2 text-sm text-[#2f8f88] shadow-[0_0_12px_rgba(129,216,208,0.24)] dark:text-cyan-200 dark:shadow-none">
          {t(locale, "이메일 인증이 완료되었습니다. 로그인해 주세요.", "Email verified. Please log in.")}
        </p>
      ) : null}

      <form action={loginAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="id" className="text-sm text-zinc-600 dark:text-zinc-200">{t(locale, "아이디", "ID")}</label>
          <input
            id="id"
            name="id"
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-zinc-600 dark:text-zinc-200">{t(locale, "비밀번호", "Password")}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-zinc-700 dark:text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>

        <button
          type="submit"
          className="rounded-full border border-[#74cfc6] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.62)] hover:shadow-[0_0_24px_rgba(129,216,208,0.72)]"
        >
          {t(locale, "로그인", "Login")}
        </button>
      </form>

      <p className="text-sm text-zinc-500 dark:text-zinc-300">
        {t(locale, "회원가입이 필요하면", "Need an account?")} {" "}
        <Link href="/auth/signup" className="text-[#2f8f88] drop-shadow-[0_0_6px_rgba(129,216,208,0.35)] transition hover:underline hover:drop-shadow-[0_0_10px_rgba(129,216,208,0.5)] dark:text-[#8fe7df] dark:drop-shadow-none">
          {t(locale, "회원가입", "Sign up")}
        </Link>
      </p>
    </section>
  );
}

