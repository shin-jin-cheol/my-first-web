import Link from "next/link";
import { redirect } from "next/navigation";
import {
  changeMemberPassword,
  clearSession,
  deleteMemberAccount,
  getMemberProfile,
  requireSession,
  updateMemberProfile,
} from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";

type GuestAccountPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function GuestAccountPage({ searchParams }: GuestAccountPageProps) {
  const locale = await getLocale();
  const session = await requireSession();

  if (session.role !== "member") {
    redirect("/guest");
  }

  const params = await searchParams;
  const errorMessage = params.error ? decodeURIComponent(params.error) : "";
  const successMessage =
    params.success === "profile"
      ? t(locale, "회원정보가 수정되었습니다.", "Member profile updated successfully.")
      :
    params.success === "password"
      ? t(locale, "비밀번호가 변경되었습니다.", "Password changed successfully.")
      : "";

  const profile = await getMemberProfile(session.userId);

  async function updateProfileAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    if (currentSession.role !== "member") {
      return;
    }

    const name = String(formData.get("name") ?? "").trim();
    const result = await updateMemberProfile(currentSession.userId, name);

    if (!result.ok) {
      const message = encodeURIComponent(result.message ?? "회원정보 수정에 실패했습니다.");
      redirect(`/guest/account?error=${message}`);
    }

    redirect("/guest/account?success=profile");
  }

  async function changePasswordAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    if (currentSession.role !== "member") {
      return;
    }

    const currentPassword = String(formData.get("currentPassword") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();

    const result = await changeMemberPassword(currentSession.userId, currentPassword, newPassword);
    if (!result.ok) {
      const message = encodeURIComponent(result.message ?? "비밀번호 변경에 실패했습니다.");
      redirect(`/guest/account?error=${message}`);
    }

    redirect("/guest/account?success=password");
  }

  async function withdrawAction(formData: FormData) {
    "use server";

    const currentSession = await requireSession();
    if (currentSession.role !== "member") {
      return;
    }

    const password = String(formData.get("withdrawPassword") ?? "").trim();
    const result = await deleteMemberAccount(currentSession.userId, password);

    if (!result.ok) {
      const message = encodeURIComponent(result.message ?? "회원 탈퇴에 실패했습니다.");
      redirect(`/guest/account?error=${message}`);
    }

    await clearSession();
    redirect("/auth/login?withdraw=1");
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-100">
          {t(locale, "계정 설정", "Account Settings")}
        </h1>
        <p className="text-zinc-300">{t(locale, "비밀번호 변경 및 회원탈퇴를 관리할 수 있습니다.", "Manage password change and account withdrawal.")}</p>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{successMessage}</p>
      ) : null}

      <form action={updateProfileAction} className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-800 p-6">
        <h2 className="text-lg font-bold text-zinc-100">{t(locale, "회원정보 수정", "Edit Member Profile")}</h2>
        <div className="space-y-2">
          <label htmlFor="member-id" className="text-sm text-zinc-200">{t(locale, "아이디", "ID")}</label>
          <input
            id="member-id"
            value={profile?.id ?? session.userId}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-zinc-400 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-zinc-200">{t(locale, "이름", "Name")}</label>
          <input
            id="name"
            name="name"
            defaultValue={profile?.name ?? ""}
            required
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>
        <button type="submit" className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200">
          {t(locale, "회원정보 저장", "Save Profile")}
        </button>
      </form>

      <form action={changePasswordAction} className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-800 p-6">
        <h2 className="text-lg font-bold text-zinc-100">{t(locale, "비밀번호 변경", "Change Password")}</h2>
        <div className="space-y-2">
          <label htmlFor="current-password" className="text-sm text-zinc-200">{t(locale, "현재 비밀번호", "Current Password")}</label>
          <input
            id="current-password"
            name="currentPassword"
            type="password"
            required
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm text-zinc-200">{t(locale, "새 비밀번호", "New Password")}</label>
          <input
            id="new-password"
            name="newPassword"
            type="password"
            required
            className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-[#81d8d0]"
          />
        </div>
        <button type="submit" className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200">
          {t(locale, "비밀번호 변경", "Change Password")}
        </button>
      </form>

      <form action={withdrawAction} className="space-y-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <h2 className="text-lg font-bold text-red-200">{t(locale, "회원 탈퇴", "Delete Account")}</h2>
        <div className="space-y-2">
          <label htmlFor="withdraw-password" className="text-sm text-red-200">{t(locale, "비밀번호 확인", "Confirm Password")}</label>
          <input
            id="withdraw-password"
            name="withdrawPassword"
            type="password"
            required
            className="w-full rounded-xl border border-red-400/60 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none"
          />
        </div>
        <button type="submit" className="rounded-full border border-red-400/70 bg-red-500/30 px-4 py-2 text-sm font-semibold text-red-100">
          {t(locale, "회원 탈퇴하기", "Delete Account")}
        </button>
      </form>

      <Link href="/guest" className="inline-flex rounded-full border border-zinc-500 bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-600">
        {t(locale, "게스트 게시판으로 돌아가기", "Back to Guest Board")}
      </Link>
    </section>
  );
}
