import {
  type AuthResult,
  OWNER_ID,
  getMemberByEmail,
  getMemberById,
  getMemberByName,
  hasSupabaseAuth,
  isValidSignupPassword,
  saveMember,
  sendSignupOtpWithSupabase,
  updateSupabaseAuthUserPassword,
  verifySignupOtp,
} from "@/lib/auth/core";

export async function registerMember(id: string, name: string, password: string): Promise<AuthResult> {
  if (!id || !name || !password) {
    return { ok: false, message: "이름, 아이디, 비밀번호를 입력해 주세요." };
  }

  if (id === OWNER_ID) {
    return { ok: false, message: "이미 사용 중인 아이디입니다." };
  }

  if (await getMemberById(id)) {
    return { ok: false, message: "이미 사용 중인 아이디입니다." };
  }

  if (await getMemberByName(name)) {
    return { ok: false, message: "이미 사용 중인 이름입니다." };
  }

  if (!isValidSignupPassword(password.trim())) {
    return {
      ok: false,
      message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함해 8자 이상이어야 합니다.",
    };
  }

  await saveMember({
    id,
    name,
    password,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true };
}

export async function sendSignupVerificationCode(
  id: string,
  name: string,
  email: string,
): Promise<AuthResult> {
  const normalizedId = id.trim();
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedId || !normalizedName || !normalizedEmail) {
    return {
      ok: false,
      message: "아이디, 이름, 이메일을 모두 입력해 주세요.",
    };
  }

  if (normalizedId === OWNER_ID) {
    return { ok: false, message: "이미 사용 중인 아이디입니다." };
  }

  if (!hasSupabaseAuth()) {
    return { ok: false, message: "Supabase Auth 환경변수가 설정되지 않았습니다." };
  }

  const existingMember = await getMemberById(normalizedId);
  if (existingMember) {
    return { ok: false, message: "이미 사용 중인 아이디입니다." };
  }

  const existingName = await getMemberByName(normalizedName);
  if (existingName) {
    return { ok: false, message: "이미 사용 중인 이름입니다." };
  }

  const existingEmail = await getMemberByEmail(normalizedEmail);
  if (existingEmail) {
    return { ok: false, message: "이미 가입된 이메일입니다." };
  }

  return sendSignupOtpWithSupabase(normalizedEmail, normalizedId, normalizedName);
}

export async function completeSignupWithVerificationCode(
  id: string,
  name: string,
  email: string,
  password: string,
  verificationCode: string,
): Promise<AuthResult> {
  const normalizedId = id.trim();
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const normalizedCode = verificationCode.replace(/\D/g, "");

  if (
    !normalizedId ||
    !normalizedName ||
    !normalizedEmail ||
    !normalizedPassword ||
    !normalizedCode
  ) {
    return { ok: false, message: "회원가입 정보를 모두 입력해 주세요." };
  }

  if (normalizedId === OWNER_ID) {
    return { ok: false, message: "이미 사용 중인 아이디입니다." };
  }

  if (!normalizedPassword) {
    return { ok: false, message: "비밀번호를 입력해 주세요." };
  }

  if (!isValidSignupPassword(normalizedPassword)) {
    return {
      ok: false,
      message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함해 8자 이상이어야 합니다.",
    };
  }

  const existingMember = await getMemberById(normalizedId);
  if (existingMember) {
    return { ok: false, message: "이미 사용 중인 아이디입니다." };
  }

  const existingName = await getMemberByName(normalizedName);
  if (existingName) {
    return { ok: false, message: "이미 사용 중인 이름입니다." };
  }

  const verified = await verifySignupOtp(normalizedEmail, normalizedCode, normalizedPassword);
  const authUser = verified?.user;

  if (!authUser?.id) {
    return { ok: false, message: "인증 코드가 올바르지 않거나 만료되었습니다." };
  }

  const memberId = authUser.user_metadata?.member_id?.trim() || normalizedId;
  const memberName = authUser.user_metadata?.name?.trim() || normalizedName;

  const passwordUpdated = await updateSupabaseAuthUserPassword(authUser.id, normalizedPassword);
  if (!passwordUpdated) {
    return { ok: false, message: "비밀번호 설정에 실패했습니다." };
  }

  await saveMember({
    id: memberId,
    name: memberName,
    email: normalizedEmail,
    emailVerified: true,
    authUserId: authUser.id,
    password: undefined,
    createdAt: new Date().toISOString(),
  });

  return { ok: true };
}
