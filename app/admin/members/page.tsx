import { getMembersForOwner, ownerAccount } from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";

export default async function AdminMembersPage() {
  const locale = await getLocale();
  const members = await getMembersForOwner();

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">Admin</p>
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base">{t(locale, "회원 계정 관리", "Member Accounts")}</h1>
        <p className="text-text-muted dark:text-text-muted">{t(locale, "주인 계정에서 회원 아이디와 비밀번호를 조회할 수 있습니다.", "Owner can view member IDs and passwords.")}</p>
      </header>

      <div className="rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong p-5">
        <p className="text-sm text-text-muted dark:text-text-muted">{t(locale, "주인 계정", "Owner Account")}</p>
        <p className="text-text-sub dark:text-text-base">ID: {ownerAccount.id}</p>
        <p className="text-text-sub dark:text-text-base">PW: ●●●●●●</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-base dark:border-border-base bg-surface dark:bg-surface-strong">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-sub dark:bg-surface-sub text-text-sub dark:text-text-sub">
            <tr>
              <th className="px-4 py-3">{t(locale, "이름", "Name")}</th>
              <th className="px-4 py-3">{t(locale, "회원 ID", "Member ID")}</th>
              <th className="px-4 py-3">{t(locale, "비밀번호", "Password")}</th>
              <th className="px-4 py-3">{t(locale, "가입일", "Created")}</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-text-muted dark:text-text-subtle" colSpan={4}>
                  {t(locale, "가입한 회원이 없습니다.", "No members found.")}
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-border-base dark:border-border-base text-text-sub dark:text-text-sub">
                  <td className="px-4 py-3">{member.name ?? "-"}</td>
                  <td className="px-4 py-3">{member.id}</td>
                  <td className="px-4 py-3">●●●●●●</td>
                  <td className="px-4 py-3">{member.createdAt.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

