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
import { safeDecodeURIComponent } from "@/lib/safe-decode";
import { getFormString } from "@/lib/form-utils";

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
  const errorMessage = params.error ? safeDecodeURIComponent(params.error) : "";
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

    const name = getFormString(formData, "name");
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

    const currentPassword = getFormString(formData, "currentPassword");
    const newPassword = getFormString(formData, "newPassword");

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

    const password = getFormString(formData, "withdrawPassword");
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
        <h1 className="text-3xl font-extrabold text-text-sub dark:text-text-base">
          {t(locale, "계정 설정", "Account Settings")}
        </h1>
        <p className="text-text-muted dark:text-text-muted">{t(locale, "비밀번호 변경 및 회원탈퇴를 관리할 수 있습니다.", "Manage password change and account withdrawal.")}</p>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-sub">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl border border-accent-border bg-accent-soft px-4 py-3 text-sm text-[#2f8f88] shadow-[0_0_6px_rgba(129,216,208,0.08)] dark:text-accent-sub dark:shadow-none">{successMessage}</p>
      ) : null}

      <form action={updateProfileAction} className="space-y-4 rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-6">
        <h2 className="text-lg font-bold text-text-sub dark:text-text-base">{t(locale, "회원정보 수정", "Edit Member Profile")}</h2>
        <div className="space-y-2">
          <label htmlFor="member-id" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "아이디", "ID")}</label>
          <input
            id="member-id"
            value={profile?.id ?? session.userId}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-border-base dark:border-border-base bg-surface-sub/80 dark:bg-surface-sub/60 px-4 py-2.5 text-text-muted dark:text-text-subtle outline-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "이름", "Name")}</label>
          <input
            id="name"
            name="name"
            defaultValue={profile?.name ?? ""}
            required
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          />
        </div>
        <button type="submit" className="rounded-full border border-accent-border bg-accent-soft px-4 py-2 text-sm font-semibold text-[#2f8f88] shadow-[0_0_8px_rgba(129,216,208,0.08)] transition hover:shadow-[0_0_8px_rgba(129,216,208,0.12)] dark:border-accent-border dark:text-accent-sub dark:shadow-none">
          {t(locale, "회원정보 저장", "Save Profile")}
        </button>
      </form>

      <form action={changePasswordAction} className="space-y-4 rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-6">
        <h2 className="text-lg font-bold text-text-sub dark:text-text-base">{t(locale, "비밀번호 변경", "Change Password")}</h2>
        <div className="space-y-2">
          <label htmlFor="current-password" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "현재 비밀번호", "Current Password")}</label>
          <input
            id="current-password"
            name="currentPassword"
            type="password"
            required
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "새 비밀번호", "New Password")}</label>
          <input
            id="new-password"
            name="newPassword"
            type="password"
            required
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[#81d8d0]"
          />
        </div>
        <button type="submit" className="rounded-full border border-accent-border bg-accent-soft px-4 py-2 text-sm font-semibold text-[#2f8f88] shadow-[0_0_8px_rgba(129,216,208,0.08)] transition hover:shadow-[0_0_8px_rgba(129,216,208,0.12)] dark:border-accent-border dark:text-accent-sub dark:shadow-none">
          {t(locale, "비밀번호 변경", "Change Password")}
        </button>
      </form>

      <form action={withdrawAction} className="space-y-4 rounded-2xl border border-danger-border bg-danger-soft p-6">
        <h2 className="text-lg font-bold text-danger-sub dark:text-danger-sub">{t(locale, "회원 탈퇴", "Delete Account")}</h2>
        <div className="space-y-2">
          <label htmlFor="withdraw-password" className="text-sm font-medium text-danger-sub dark:text-danger-sub">{t(locale, "비밀번호 확인", "Confirm Password")}</label>
          <input
            id="withdraw-password"
            name="withdrawPassword"
            type="password"
            required
            className="w-full rounded-xl border border-danger-border bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none"
          />
        </div>
        <p className="text-sm text-danger-sub dark:text-danger-sub">
          {t(locale, "탈퇴 후에는 계정을 복구할 수 없습니다. 신중하게 진행해 주세요.", "Your account cannot be restored after deletion. Please proceed carefully.")}
        </p>
        <button type="submit" className="rounded-full border border-danger-border bg-danger-soft px-4 py-2 text-sm font-semibold text-danger-sub transition hover:bg-danger-soft dark:border-danger-border dark:bg-danger-soft dark:text-danger-sub">
          {t(locale, "회원 탈퇴하기", "Delete Account")}
        </button>
      </form>

      <Link href="/guest" className="inline-flex rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong">
        {t(locale, "게스트 게시판으로 돌아가기", "Back to Guest Board")}
      </Link>
    </section>
  );
}

