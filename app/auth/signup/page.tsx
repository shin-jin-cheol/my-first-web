import Link from "next/link";
import { getLocale, t } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import SendCodeButton from "./SendCodeButton";
import SignupPasswordField from "./SignupPasswordField";
import { signupAction } from "@/app/auth/actions";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    id?: string;
    name?: string;
    email?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const errorMessage = params.error ?? "";
  const showSentMessage = params.sent === "1";

  return (
    <section className="mx-auto max-w-xl space-y-6 rounded-2xl border border-border-base bg-surface p-7 shadow-[0_0_24px_rgb(from_var(--accent-primary)_r_g_b_/_0.14)] dark:border-border-base dark:bg-surface-strong">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
          Auth
        </p>
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">
          {t(locale, "회원가입", "Sign up")}
        </h1>
        <p className="text-text-muted dark:text-text-muted">
          {showSentMessage
            ? t(
                locale,
                "이메일로 받은 인증 코드를 입력하고 비밀번호를 정하면 회원가입이 완료됩니다.",
                "Enter the verification code from your email and choose a password to finish signing up.",
              )
            : t(
                locale,
                "이름, 아이디, 이메일을 먼저 입력하고 인증 코드를 받아 주세요.",
                "Enter your name, ID, and email first, then request a verification code.",
              )}
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-2 text-sm text-danger-sub">
          {errorMessage}
        </p>
      ) : null}

      {showSentMessage ? (
        <div className="rounded-xl border border-accent-border bg-accent-soft px-4 py-3 text-sm text-[var(--accent-dark)] shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.24)] dark:text-accent-sub dark:shadow-none">
          <p>
            {t(
              locale,
              "인증 코드를 이메일로 전송했습니다. 메일함과 스팸함을 함께 확인해 주세요.",
              "We sent a verification code. Please check both your inbox and spam folder.",
            )}
          </p>
          <p className="mt-1 text-xs">
            {t(
              locale,
              "메일 서비스 보호를 위해 인증 코드는 60초 뒤에 다시 보낼 수 있습니다.",
              "For email delivery protection, you can resend the code after 60 seconds.",
            )}
          </p>
        </div>
      ) : null}

      <form action={signupAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-text-sub dark:text-text-sub">
            {t(locale, "이름", "Name")}
          </label>
          <Input
            id="name"
            name="name"
            required
            readOnly={showSentMessage}
            defaultValue={params.name ?? ""}
            className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none focus:border-[var(--accent-primary)] read-only:bg-surface-muted read-only:text-text-muted dark:border-border-sub dark:bg-surface-sub dark:text-text-base dark:read-only:bg-surface-strong dark:read-only:text-text-muted"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="id" className="text-sm text-text-sub dark:text-text-sub">
            {t(locale, "아이디", "ID")}
          </label>
          <Input
            id="id"
            name="id"
            required
            readOnly={showSentMessage}
            defaultValue={params.id ?? ""}
            className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none focus:border-[var(--accent-primary)] read-only:bg-surface-muted read-only:text-text-muted dark:border-border-sub dark:bg-surface-sub dark:text-text-base dark:read-only:bg-surface-strong dark:read-only:text-text-muted"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-text-sub dark:text-text-sub">
            {t(locale, "이메일", "Email")}
          </label>
          <div className="flex items-stretch gap-3">
            <Input
              id="email"
              name="email"
              type="email"
              required
              readOnly={showSentMessage}
              defaultValue={params.email ?? ""}
              className="min-w-0 flex-1 rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none focus:border-[var(--accent-primary)] read-only:bg-surface-muted read-only:text-text-muted dark:border-border-sub dark:bg-surface-sub dark:text-text-base dark:read-only:bg-surface-strong dark:read-only:text-text-muted"
            />
            <SendCodeButton
              idleLabel={t(
                locale,
                showSentMessage ? "코드 재전송" : "코드 전송",
                showSentMessage ? "Resend Code" : "Send Code",
              )}
              cooldownLabel={t(locale, "재전송 대기", "Wait")}
              startCooldown={showSentMessage}
            />
          </div>
          {!showSentMessage ? (
            <p className="text-xs text-text-muted dark:text-text-muted">
              {t(
                locale,
                "인증 코드를 받은 뒤 비밀번호를 입력해 회원가입을 완료합니다.",
                "After receiving the code, enter your password to complete sign up.",
              )}
            </p>
          ) : null}
        </div>

        {showSentMessage ? (
          <>
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm text-text-sub dark:text-text-sub"
              >
                {t(locale, "인증 코드", "Verification Code")}
              </label>
            <Input
              id="verificationCode"
              name="verificationCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              pattern="\d{6,8}"
              placeholder={t(locale, "인증 코드 숫자", "Verification code")}
              required
              className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none focus:border-[var(--accent-primary)] dark:border-border-sub dark:bg-surface-sub dark:text-text-base"
            />
              <p className="text-xs text-text-muted dark:text-text-muted">
                {t(
                  locale,
                  "이메일로 받은 인증 코드 숫자를 그대로 입력해 주세요.",
                  "Enter the numeric verification code exactly as shown in the email.",
                )}
              </p>
            </div>

            <SignupPasswordField
              label={t(locale, "비밀번호", "Password")}
              title={t(
                locale,
                "비밀번호는 영문, 숫자, 특수문자를 모두 포함한 8자 이상이어야 합니다.",
                "Password must be at least 8 characters and include letters, numbers, and special characters.",
              )}
              helperText={t(
                locale,
                "아래 규칙을 모두 만족하면 회원가입이 가능합니다.",
                "You can sign up once all of the rules below are satisfied.",
              )}
              lengthText={t(locale, "8자 이상", "At least 8 characters")}
              letterText={t(locale, "영문 포함", "Contains letters")}
              numberText={t(locale, "숫자 포함", "Contains numbers")}
              specialText={t(locale, "특수문자 포함", "Contains special characters")}
            />

            <button
              type="submit"
              className="rounded-full border border-[var(--accent-mid)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_20px_rgb(from_var(--accent-primary)_r_g_b_/_0.62)] hover:shadow-[0_0_24px_rgb(from_var(--accent-primary)_r_g_b_/_0.72)]"
            >
              {t(locale, "회원가입 완료", "Complete Sign up")}
            </button>
          </>
        ) : null}
      </form>

      <p className="text-sm text-text-muted dark:text-text-muted">
        {t(locale, "이미 계정이 있으면", "Already have an account?")}{" "}
        <Link
          href="/auth/login"
          className="text-[var(--accent-dark)] drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.35)] transition hover:underline hover:drop-shadow-[0_0_10px_rgb(from_var(--accent-primary)_r_g_b_/_0.5)] dark:text-[var(--accent-light-sub)] dark:drop-shadow-none"
        >
          {t(locale, "로그인", "Login")}
        </Link>
      </p>
    </section>
  );
}
