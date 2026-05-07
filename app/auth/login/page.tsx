import Link from "next/link";
import { getLocale, t } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/app/auth/actions";

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
    <section className="mx-auto max-w-xl space-y-6 rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-7 shadow-[0_0_24px_rgba(129,216,208,0.14)]">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">Auth</p>
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">{t(locale, "로그인", "Login")}</h1>
        <p className="text-text-muted dark:text-text-muted">{t(locale, "로그인 후 이용 가능합니다.", "Login required to continue.")}</p>
      </header>

      {showError ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-2 text-sm text-danger-sub">
          {t(locale, "아이디 또는 비밀번호가 올바르지 않습니다.", "Invalid ID or password.")}
        </p>
      ) : null}

      {showWithdrawMessage ? (
        <p className="rounded-xl border border-accent-border bg-accent-soft px-4 py-2 text-sm text-[#2f8f88] shadow-[0_0_12px_rgba(129,216,208,0.24)] dark:text-accent-sub dark:shadow-none">
          {t(locale, "회원 탈퇴가 완료되었습니다.", "Your account has been deleted.")}
        </p>
      ) : null}

      {showSignupMessage ? (
        <p className="rounded-xl border border-accent-border bg-accent-soft px-4 py-2 text-sm text-[#2f8f88] shadow-[0_0_12px_rgba(129,216,208,0.24)] dark:text-accent-sub dark:shadow-none">
          {t(locale, "이메일 인증이 완료되었습니다. 로그인해 주세요.", "Email verified. Please log in.")}
        </p>
      ) : null}

      <form action={loginAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="id" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "아이디", "ID")}</label>
          <Input
            id="id"
            name="id"
            required
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "비밀번호", "Password")}</label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-border-base dark:border-border-base bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          />
        </div>

        <button
          type="submit"
          className="rounded-full border border-[#74cfc6] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_20px_rgba(129,216,208,0.62)] hover:shadow-[0_0_24px_rgba(129,216,208,0.72)]"
        >
          {t(locale, "로그인", "Login")}
        </button>
      </form>

      <p className="text-sm text-text-muted dark:text-text-muted">
        {t(locale, "회원가입이 필요하면", "Need an account?")} {" "}
        <Link href="/auth/signup" className="text-[#2f8f88] drop-shadow-[0_0_6px_rgba(129,216,208,0.35)] transition hover:underline hover:drop-shadow-[0_0_10px_rgba(129,216,208,0.5)] dark:text-[#8fe7df] dark:drop-shadow-none">
          {t(locale, "회원가입", "Sign up")}
        </Link>
      </p>
    </section>
  );
}

