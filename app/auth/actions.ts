"use server";

import { redirect } from "next/navigation";
import { changeMemberPassword, clearSession, completeSignupWithVerificationCode, deleteMemberAccount, login, requireSession, sendSignupVerificationCode, setSession, updateMemberProfile } from "@/lib/auth";
import { getFormString } from "@/lib/form-utils";
import { isRedirectError } from "@/lib/redirect-error";

const SIGNUP_CODE_SEND_FAILED_MESSAGE = "인증 코드 전송에 실패했습니다.";
const SIGNUP_FAILED_MESSAGE = "회원가입에 실패했습니다.";
const SERVER_ERROR_MESSAGE = "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
const PROFILE_UPDATE_FAILED_MESSAGE = "회원정보 수정에 실패했습니다.";
const PASSWORD_CHANGE_FAILED_MESSAGE = "비밀번호 변경에 실패했습니다.";
const WITHDRAW_FAILED_MESSAGE = "회원 탈퇴에 실패했습니다.";

function buildSignupQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  return `/auth/signup?${search.toString()}`;
}

export async function loginAction(formData: FormData) {
  const id = getFormString(formData, "id");
  const password = getFormString(formData, "password");

  const session = await login(id, password);
  if (!session) {
    redirect("/auth/login?error=1");
  }

  await setSession(session);
  redirect("/");
}

export async function signupAction(formData: FormData) {
  try {
    const intent = getFormString(formData, "intent");
    const id = getFormString(formData, "id");
    const name = getFormString(formData, "name");
    const email = getFormString(formData, "email");

    if (intent === "send-code") {
      const result = await sendSignupVerificationCode(id, name, email);
      if (!result.ok) {
        redirect(
          buildSignupQuery({
            error: result.message ?? SIGNUP_CODE_SEND_FAILED_MESSAGE,
            id,
            name,
            email,
          }),
        );
      }

      redirect(
        buildSignupQuery({
          sent: "1",
          id,
          name,
          email,
        }),
      );
    }

    const password = getFormString(formData, "password");
    const verificationCode = getFormString(formData, "verificationCode");

    const result = await completeSignupWithVerificationCode(
      id,
      name,
      email,
      password,
      verificationCode,
    );

    if (!result.ok) {
      redirect(
        buildSignupQuery({
          error: result.message ?? SIGNUP_FAILED_MESSAGE,
          sent: "1",
          id,
          name,
          email,
        }),
      );
    }

    redirect("/auth/login?signup=1");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildSignupQuery({
        error: SERVER_ERROR_MESSAGE,
        sent: "1",
      }),
    );
  }
}

export async function updateProfileAction(formData: FormData) {
  const currentSession = await requireSession();
  if (currentSession.role !== "member") {
    return;
  }

  const name = getFormString(formData, "name");
  const result = await updateMemberProfile(currentSession.userId, name);

  if (!result.ok) {
    const message = encodeURIComponent(result.message ?? PROFILE_UPDATE_FAILED_MESSAGE);
    redirect(`/guest/account?error=${message}`);
  }

  redirect("/guest/account?success=profile");
}

export async function changePasswordAction(formData: FormData) {
  const currentSession = await requireSession();
  if (currentSession.role !== "member") {
    return;
  }

  const currentPassword = getFormString(formData, "currentPassword");
  const newPassword = getFormString(formData, "newPassword");

  const result = await changeMemberPassword(currentSession.userId, currentPassword, newPassword);
  if (!result.ok) {
    const message = encodeURIComponent(result.message ?? PASSWORD_CHANGE_FAILED_MESSAGE);
    redirect(`/guest/account?error=${message}`);
  }

  redirect("/guest/account?success=password");
}

export async function withdrawAction(formData: FormData) {
  const currentSession = await requireSession();
  if (currentSession.role !== "member") {
    return;
  }

  const password = getFormString(formData, "withdrawPassword");
  const result = await deleteMemberAccount(currentSession.userId, password);

  if (!result.ok) {
    const message = encodeURIComponent(result.message ?? WITHDRAW_FAILED_MESSAGE);
    redirect(`/guest/account?error=${message}`);
  }

  await clearSession();
  redirect("/auth/login?withdraw=1");
}

export async function logoutAction() {
  await clearSession();
  redirect("/auth/login");
}
