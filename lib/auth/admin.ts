import { requireOwner } from "@/lib/auth/session";
import { type OwnerMemberView, readMembers } from "@/lib/auth/core";

export async function getMembersForOwner(): Promise<OwnerMemberView[]> {
  await requireOwner();

  const members = await readMembers();
  return members.map((member) => ({
    id: member.id,
    name: member.name,
    password: member.password ?? "Supabase Auth",
    createdAt: member.createdAt,
  }));
}

export async function getMemberSummaries() {
  const members = await readMembers();
  return members.map((member) => ({
    id: member.id,
    name: member.name,
  }));
}
