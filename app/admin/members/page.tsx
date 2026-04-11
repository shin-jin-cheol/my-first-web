import { getMembersForOwner, ownerAccount } from "@/lib/auth";
import { getLocale, t } from "@/lib/i18n";

export default async function AdminMembersPage() {
  const locale = await getLocale();
  const members = await getMembersForOwner();

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Admin</p>
        <h1 className="text-4xl font-extrabold text-zinc-100">{t(locale, "회원 계정 관리", "Member Accounts")}</h1>
        <p className="text-zinc-300">{t(locale, "주인 계정에서 회원 아이디/비밀번호를 조회할 수 있습니다.", "Owner can view member IDs and passwords.")}</p>
      </header>

      <div className="rounded-2xl border border-zinc-700 bg-zinc-800 p-5">
        <p className="text-sm text-zinc-300">{t(locale, "주인 계정", "Owner Account")}</p>
        <p className="text-zinc-100">ID: {ownerAccount.id}</p>
        <p className="text-zinc-100">PW: {ownerAccount.password}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-200">
            <tr>
              <th className="px-4 py-3">회원 ID</th>
              <th className="px-4 py-3">{t(locale, "비밀번호", "Password")}</th>
              <th className="px-4 py-3">{t(locale, "가입일", "Created")}</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-zinc-400" colSpan={3}>
                  {t(locale, "가입된 회원이 없습니다.", "No members found.")}
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-zinc-700 text-zinc-200">
                  <td className="px-4 py-3">{member.id}</td>
                  <td className="px-4 py-3">{member.password}</td>
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
