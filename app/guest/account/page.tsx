import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getMemberProfile,
  requireSession,
} from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeDecodeURIComponent } from "@/lib/safe-decode";
import { changePasswordAction, updateProfileAction, withdrawAction } from "@/app/auth/actions";

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
        <p className="rounded-xl border border-accent-border bg-accent-soft px-4 py-3 text-sm text-[var(--accent-dark)] shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] dark:text-accent-sub dark:shadow-none">{successMessage}</p>
      ) : null}

      <form action={updateProfileAction} className="space-y-4 rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-6">
        <h2 className="text-lg font-bold text-text-sub dark:text-text-base">{t(locale, "회원정보 수정", "Edit Member Profile")}</h2>
        <div className="space-y-2">
          <label htmlFor="member-id" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "아이디", "ID")}</label>
          <Input
            id="member-id"
            value={profile?.id ?? session.userId}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-border-base dark:border-border-base bg-surface-sub/80 dark:bg-surface-sub/60 px-4 py-2.5 text-text-muted dark:text-text-subtle outline-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "이름", "Name")}</label>
          <Input
            id="name"
            name="name"
            defaultValue={profile?.name ?? ""}
            required
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <Button type="submit" className="rounded-full border border-accent-border bg-accent-soft px-4 py-2 text-sm font-semibold text-[var(--accent-dark)] shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] transition hover:shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.12)] dark:border-accent-border dark:text-accent-sub dark:shadow-none">
          {t(locale, "회원정보 저장", "Save Profile")}
        </Button>
      </form>

      <form action={changePasswordAction} className="space-y-4 rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-6">
        <h2 className="text-lg font-bold text-text-sub dark:text-text-base">{t(locale, "비밀번호 변경", "Change Password")}</h2>
        <div className="space-y-2">
          <label htmlFor="current-password" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "현재 비밀번호", "Current Password")}</label>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            required
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm text-text-sub dark:text-text-sub">{t(locale, "새 비밀번호", "New Password")}</label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            required
            className="w-full rounded-xl border border-border-base dark:border-border-sub bg-surface-sub dark:bg-surface-sub px-4 py-2.5 text-text-sub dark:text-text-base outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <Button type="submit" className="rounded-full border border-accent-border bg-accent-soft px-4 py-2 text-sm font-semibold text-[var(--accent-dark)] shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] transition hover:shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.12)] dark:border-accent-border dark:text-accent-sub dark:shadow-none">
          {t(locale, "비밀번호 변경", "Change Password")}
        </Button>
      </form>

      <form action={withdrawAction} className="space-y-4 rounded-2xl border border-danger-border bg-danger-soft p-6">
        <h2 className="text-lg font-bold text-danger-sub dark:text-danger-sub">{t(locale, "회원 탈퇴", "Delete Account")}</h2>
        <div className="space-y-2">
          <label htmlFor="withdraw-password" className="text-sm font-medium text-danger-sub dark:text-danger-sub">{t(locale, "비밀번호 확인", "Confirm Password")}</label>
          <Input
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
        <Button type="submit" className="rounded-full border border-danger-border bg-danger-soft px-4 py-2 text-sm font-semibold text-danger-sub transition hover:bg-danger-soft dark:border-danger-border dark:bg-danger-soft dark:text-danger-sub">
          {t(locale, "회원 탈퇴하기", "Delete Account")}
        </Button>
      </form>

      <Link href="/guest" className="inline-flex rounded-full border border-border-base dark:border-border-strong bg-surface-strong dark:bg-surface-sub px-4 py-2 text-sm font-semibold text-text-sub dark:text-text-base transition hover:bg-surface-muted dark:hover:bg-surface-strong">
        {t(locale, "게스트 게시판으로 돌아가기", "Back to Guest Board")}
      </Link>
    </section>
  );
}

