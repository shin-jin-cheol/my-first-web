import {
  type AuthResult,
  OWNER_ID,
  deleteMemberById,
  deleteSupabaseAuthUser,
  getMemberById,
  hasSupabaseAuth,
  saveMember,
  signInMemberWithSupabase,
  updateSupabaseAuthUserPassword,
} from "@/lib/auth/core";

export async function getMemberProfile(userId: string) {
  if (!userId || userId === OWNER_ID) {
    return null;
  }

  const member = await getMemberById(userId);
  if (!member) {
    return null;
  }

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    createdAt: member.createdAt,
  };
}

export async function updateMemberProfile(userId: string, name: string): Promise<AuthResult> {
  if (!userId || userId === OWNER_ID) {
    return { ok: false, message: "회원 계정만 수정할 수 있습니다." };
  }

  const member = await getMemberById(userId);
  if (!member) {
    return { ok: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  const nextName = name.trim();
  if (!nextName) {
    return { ok: false, message: "이름을 입력해 주세요." };
  }

  await saveMember({
    ...member,
    name: nextName,
  });

  return { ok: true };
}

export async function changeMemberPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  if (!userId || userId === OWNER_ID) {
    return { ok: false, message: "회원 계정만 비밀번호를 변경할 수 있습니다." };
  }

  const member = await getMemberById(userId);
  if (!member) {
    return { ok: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  const normalizedCurrentPassword = currentPassword.trim();
  const normalizedNewPassword = newPassword.trim();

  if (!normalizedCurrentPassword || !normalizedNewPassword) {
    return {
      ok: false,
      message: "현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.",
    };
  }

  if (member.email && member.authUserId && hasSupabaseAuth()) {
    const authData = await signInMemberWithSupabase(member.email, normalizedCurrentPassword);

    if (!authData?.user?.id) {
      return { ok: false, message: "현재 비밀번호가 올바르지 않습니다." };
    }

    const updated = await updateSupabaseAuthUserPassword(member.authUserId, normalizedNewPassword);
    return updated
      ? { ok: true }
      : { ok: false, message: "비밀번호 변경에 실패했습니다." };
  }

  if (member.password !== normalizedCurrentPassword) {
    return { ok: false, message: "현재 비밀번호가 올바르지 않습니다." };
  }

  await saveMember({
    ...member,
    password: normalizedNewPassword,
  });

  return { ok: true };
}

export async function deleteMemberAccount(userId: string, password: string): Promise<AuthResult> {
  if (!userId || userId === OWNER_ID) {
    return { ok: false, message: "회원 계정만 탈퇴할 수 있습니다." };
  }

  const member = await getMemberById(userId);
  if (!member) {
    return { ok: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  const normalizedPassword = password.trim();
  if (!normalizedPassword) {
    return { ok: false, message: "비밀번호를 입력해 주세요." };
  }

  if (member.email && member.authUserId && hasSupabaseAuth()) {
    const authData = await signInMemberWithSupabase(member.email, normalizedPassword);

    if (!authData?.user?.id) {
      return { ok: false, message: "비밀번호가 올바르지 않습니다." };
    }

    const deleted = await deleteSupabaseAuthUser(member.authUserId);
    if (!deleted) {
      return { ok: false, message: "회원 탈퇴에 실패했습니다." };
    }

    await deleteMemberById(member.id);
    return { ok: true };
  }

  if (member.password !== normalizedPassword) {
    return { ok: false, message: "비밀번호가 올바르지 않습니다." };
  }

  await deleteMemberById(member.id);
  return { ok: true };
}
