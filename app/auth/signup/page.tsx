import Link from "next/link";
import { redirect } from "next/navigation";
import {
  completeSignupWithVerificationCode,
  sendSignupVerificationCode,
} from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.includes("NEXT_REDIRECT")
  );
}

function buildSignupQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  return `/auth/signup?${search.toString()}`;
}

async function sendCodeAction(formData: FormData) {
  "use server";

  try {
    const id = String(formData.get("id") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    const result = await sendSignupVerificationCode(id, name, email, password);
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
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSignupQuery({
        error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      }),
    );
  }
}

async function signupAction(formData: FormData) {
  "use server";

  try {
    const id = String(formData.get("id") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
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
          {t(
            locale,
            "이메일 인증 코드를 확인한 뒤 회원가입을 완료해 주세요.",
            "Send a verification code to your email, then finish signing up.",
          )}
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {showSentMessage ? (
        <p className="rounded-xl border border-cyan-600/40 bg-cyan-500/10 px-4 py-2 text-sm text-[#2f8f88] shadow-[0_0_12px_rgba(129,216,208,0.24)] dark:text-cyan-200 dark:shadow-none">
          {t(
            locale,
            "인증 코드를 이메일로 전송했습니다. 코드를 입력한 뒤 회원가입을 완료해 주세요.",
            "Verification code sent. Enter it below to finish signing up.",
          )}
        </p>
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
            defaultValue={params.name ?? ""}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
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
            defaultValue={params.id ?? ""}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-zinc-600 dark:text-zinc-200">
            {t(locale, "이메일", "Email")}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={params.email ?? ""}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              formAction={sendCodeAction}
              formNoValidate
              className="rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-[#81d8d0] hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-100 dark:hover:border-[#81d8d0]"
            >
              {t(locale, "코드 전송", "Send Code")}
            </button>
          </div>
        </div>

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
            required
            className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-zinc-600 dark:text-zinc-200">
            {t(locale, "비밀번호", "Password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-zinc-700 outline-none focus:border-[#81d8d0] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <button
          type="submit"
          className="rounded-full border border-[#74cfc6] bg-[#81d8d0] px-4 py-2 text-sm font-semibold text-zinc-900 shadow-[0_0_20px_rgba(129,216,208,0.62)] hover:shadow-[0_0_24px_rgba(129,216,208,0.72)]"
        >
          {t(locale, "회원가입 완료", "Complete Sign up")}
        </button>
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
