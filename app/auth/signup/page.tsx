import Link from "next/link";
import { redirect } from "next/navigation";
import { registerMember } from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";

async function signupAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const result = await registerMember(id, name, password);
  if (!result.ok) {
    const message = encodeURIComponent(result.message ?? "회원가입에 실패했습니다.");
    redirect(`/auth/signup?error=${message}`);
  }

  redirect("/auth/login");
}

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";

  return (
    <section className="mx-auto max-w-xl space-y-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-7 shadow-[0_0_24px_rgba(129,216,208,0.14)]">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Auth</p>
        <h1 className="text-3xl font-extrabold text-zinc-100">{t(locale, "회원가입", "Sign up")}</h1>
        <p className="text-zinc-300">{t(locale, "회원 계정을 만들고 게스트 게시판을 이용하세요.", "Create a member account and use the guest board.")}</p>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <form action={signupAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-zinc-200">{t(locale, "이름", "Name")}</label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>
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
          {t(locale, "회원가입", "Sign up")}
        </button>
      </form>

      <p className="text-sm text-zinc-300">
        {t(locale, "이미 계정이 있으면", "Already have an account?")} {" "}
        <Link href="/auth/login" className="text-[#81d8d0] hover:underline">
          {t(locale, "로그인", "Login")}
        </Link>
      </p>
    </section>
  );
}
