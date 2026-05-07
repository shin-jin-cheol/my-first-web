import type { Session } from "@/lib/auth/session";
import { OWNER_ID, OWNER_NAME, OWNER_PASSWORD } from "@/lib/env";
import {
  getMemberById,
  hasSupabaseAuth,
  saveMember,
  signInMemberWithSupabase,
} from "@/lib/auth/core";

export async function login(id: string, password: string): Promise<Session | null> {
  const normalizedId = id.trim();
  const normalizedPassword = password.trim();

  if (!normalizedId || !normalizedPassword) {
    return null;
  }

  if (normalizedId === OWNER_ID && normalizedPassword === OWNER_PASSWORD) {
    return {
      userId: OWNER_ID,
      role: "owner",
      userName: OWNER_NAME,
    };
  }

  const member = await getMemberById(normalizedId);
  if (!member) {
    return null;
  }

  if (member.email && hasSupabaseAuth()) {
    const authData = await signInMemberWithSupabase(member.email, normalizedPassword);
    const authUser = authData?.user;

    if (!authUser?.id) {
      return null;
    }

    if (
      member.authUserId !== authUser.id ||
      member.emailVerified !== Boolean(authUser.email_confirmed_at)
    ) {
      await saveMember({
        ...member,
        authUserId: authUser.id,
        emailVerified: Boolean(authUser.email_confirmed_at),
      });
    }
  } else if (member.password !== normalizedPassword) {
    return null;
  }

  return {
    userId: member.id,
    role: "member",
    userName: member.name || member.id,
  };
}
