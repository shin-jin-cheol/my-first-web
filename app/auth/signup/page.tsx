import Link from "next/link";
import { redirect } from "next/navigation";
import {
  completeSignupWithVerificationCode,
  sendSignupVerificationCode,
} from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";
import SendCodeButton from "./SendCodeButton";
import SignupPasswordField from "./SignupPasswordField";
import { isRedirectError } from "@/lib/redirect-error";

function buildSignupQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  return `/auth/signup?${search.toString()}`;
}

async function signupAction(formData: FormData) {
  "use server";

  try {
    const intent = String(formData.get("intent") ?? "").trim();
    const id = String(formData.get("id") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (intent === "send-code") {
      const result = await sendSignupVerificationCode(id, name, email);
      if (!result.ok) {
        redirect(
          buildSignupQuery({
            error: result.message ?? "인증 코드 전송에 실패했습니다.",
            id,
            name,
            email,
          }),
        );
      }

      redirect(
        buildSignupQuery({
          sent: "1",
          id,
          name,
          email,
        }),
      );
    }

    const password = String(formData.get("password") ?? "").trim();
    const verificationCode = String(formData.get("verificationCode") ?? "").trim();

    const result = await completeSignupWithVerificationCode(
      id,
      name,
      email,
      password,
      verificationCode,
    );

    if (!result.ok) {
      redirect(
        buildSignupQuery({
          error: result.message ?? "회원가입에 실패했습니다.",
          sent: "1",
          id,
          name,
          email,
        }),
      );
    }

    redirect("/auth/login?signup=1");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSignupQuery({
        error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        sent: "1",
      }),
    );
  }
}

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
    <section className="mx-auto max-w-xl space-y-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-7 shadow-[0_0_24px_rgba(129,216,208,0.14)] dark:border-zinc-700 dark:bg-zinc-800">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Auth
        </p>
        <h1 className="text-3xl font-extrabold text-zinc-700 dark:text-zinc-100">
          {t(locale, "회원가입", "Sign up")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-300">
          {showSentMessage
            ? t(
                locale,
                "메일로 받은 인증 코드를 입력하고 비밀번호를 정하면 회원가입이 완료됩니다.",
                "Enter the verification code from your email and choose a password to finish signing up.",
              )
            : t(
                locale,
                "이름, 아이디, 이메일을 먼저 입력한 뒤 인증 코드를 받아 주세요.",
                "Enter your name, ID, and email first, then request a verification code.",
              )}
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {showSentMessage ? (
        <div className="rounded-xl border border-cyan-600/40 bg-cyan-500/10 px-4 py-3 text-sm text-[#2f8f88] shadow-[0_0_12px_rgba(129,216,208,0.24)] dark:text-cyan-200 dark:shadow-none">
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
          <label htmlFor="name" className="text-sm text-zinc-600 dark:text-zinc-200">
            {t(locale, "이름", "Name")}
          </label>
          <input
            id="name"
            name="name"
            required
            readOnly={showSentMessage}
            defaultValue={params.name ?? ""}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] read-only:bg-zinc-200 read-only:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:read-only:bg-zinc-800 dark:read-only:text-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="id" className="text-sm text-zinc-600 dark:text-zinc-200">
            {t(locale, "아이디", "ID")}
          </label>
          <input
            id="id"
            name="id"
            required
            readOnly={showSentMessage}
            defaultValue={params.id ?? ""}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] read-only:bg-zinc-200 read-only:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:read-only:bg-zinc-800 dark:read-only:text-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-zinc-600 dark:text-zinc-200">
            {t(locale, "이메일", "Email")}
          </label>
          <div className="flex items-stretch gap-3">
            <input
              id="email"
              name="email"
              type="email"
              required
              readOnly={showSentMessage}
              defaultValue={params.email ?? ""}
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] read-only:bg-zinc-200 read-only:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:read-only:bg-zinc-800 dark:read-only:text-zinc-300"
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
            <p className="text-xs text-zinc-500 dark:text-zinc-300">
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
                className="text-sm text-zinc-600 dark:text-zinc-200"
              >
                {t(locale, "인증 코드", "Verification Code")}
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                pattern="\d{6,8}"
                placeholder={t(locale, "인증 코드 숫자", "Verification code")}
                required
                className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-300">
                {t(
                  locale,
                  "메일로 받은 인증 코드 숫자를 그대로 입력해 주세요.",
                  "Enter the numeric verification code exactly as shown in the email.",
                )}
              </p>
            </div>

            <SignupPasswordField
              label={t(locale, "비밀번호", "Password")}
              title={t(
                locale,
                "비밀번호는 영문, 숫자, 특수문자를 모두 포함해 8자 이상이어야 합니다.",
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
              className="rounded-full border border-[#74cfc6] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.62)] hover:shadow-[0_0_24px_rgba(129,216,208,0.72)]"
            >
              {t(locale, "회원가입 완료", "Complete Sign up")}
            </button>
          </>
        ) : null}
      </form>

      <p className="text-sm text-zinc-500 dark:text-zinc-300">
        {t(locale, "이미 계정이 있으면", "Already have an account?")}{" "}
        <Link
          href="/auth/login"
          className="text-[#2f8f88] drop-shadow-[0_0_6px_rgba(129,216,208,0.35)] transition hover:underline hover:drop-shadow-[0_0_10px_rgba(129,216,208,0.5)] dark:text-[#8fe7df] dark:drop-shadow-none"
        >
          {t(locale, "로그인", "Login")}
        </Link>
      </p>
    </section>
  );
}
