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
                "硫붿씪濡?諛쏆? ?몄쬆 肄붾뱶瑜??낅젰?섍퀬 鍮꾨?踰덊샇瑜??뺥븯硫??뚯썝媛?낆씠 ?꾨즺?⑸땲??",
                "Enter the verification code from your email and choose a password to finish signing up.",
              )
            : t(
                locale,
                "?대쫫, ?꾩씠?? ?대찓?쇱쓣 癒쇱? ?낅젰?????몄쬆 肄붾뱶瑜?諛쏆븘 二쇱꽭??",
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
              "?몄쬆 肄붾뱶瑜??대찓?쇰줈 ?꾩넚?덉뒿?덈떎. 硫붿씪?④낵 ?ㅽ뙵?⑥쓣 ?④퍡 ?뺤씤??二쇱꽭??",
              "We sent a verification code. Please check both your inbox and spam folder.",
            )}
          </p>
          <p className="mt-1 text-xs">
            {t(
              locale,
              "硫붿씪 ?쒕퉬??蹂댄샇瑜??꾪빐 ?몄쬆 肄붾뱶??60珥??ㅼ뿉 ?ㅼ떆 蹂대궪 ???덉뒿?덈떎.",
              "For email delivery protection, you can resend the code after 60 seconds.",
            )}
          </p>
        </div>
      ) : null}

      <form action={signupAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-text-sub dark:text-text-sub">
            {t(locale, "?대쫫", "Name")}
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
                "?몄쬆 肄붾뱶瑜?諛쏆? ??鍮꾨?踰덊샇瑜??낅젰???뚯썝媛?낆쓣 ?꾨즺?⑸땲??",
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
                {t(locale, "?몄쬆 肄붾뱶", "Verification Code")}
              </label>
            <Input
              id="verificationCode"
              name="verificationCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              pattern="\d{6,8}"
              placeholder={t(locale, "?몄쬆 肄붾뱶 ?レ옄", "Verification code")}
              required
              className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none focus:border-[var(--accent-primary)] dark:border-border-sub dark:bg-surface-sub dark:text-text-base"
            />
              <p className="text-xs text-text-muted dark:text-text-muted">
                {t(
                  locale,
                  "硫붿씪濡?諛쏆? ?몄쬆 肄붾뱶 ?レ옄瑜?洹몃?濡??낅젰??二쇱꽭??",
                  "Enter the numeric verification code exactly as shown in the email.",
                )}
              </p>
            </div>

            <SignupPasswordField
              label={t(locale, "鍮꾨?踰덊샇", "Password")}
              title={t(
                locale,
                "鍮꾨?踰덊샇???곷Ц, ?レ옄, ?뱀닔臾몄옄瑜?紐⑤몢 ?ы븿??8???댁긽?댁뼱???⑸땲??",
                "Password must be at least 8 characters and include letters, numbers, and special characters.",
              )}
              helperText={t(
                locale,
                "?꾨옒 洹쒖튃??紐⑤몢 留뚯”?섎㈃ ?뚯썝媛?낆씠 媛?ν빀?덈떎.",
                "You can sign up once all of the rules below are satisfied.",
              )}
              lengthText={t(locale, "8???댁긽", "At least 8 characters")}
              letterText={t(locale, "?곷Ц ?ы븿", "Contains letters")}
              numberText={t(locale, "?レ옄 ?ы븿", "Contains numbers")}
              specialText={t(locale, "?뱀닔臾몄옄 ?ы븿", "Contains special characters")}
            />

            <button
              type="submit"
              className="rounded-full border border-[var(--accent-mid)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_20px_rgb(from_var(--accent-primary)_r_g_b_/_0.62)] hover:shadow-[0_0_24px_rgb(from_var(--accent-primary)_r_g_b_/_0.72)]"
            >
              {t(locale, "?뚯썝媛???꾨즺", "Complete Sign up")}
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
