"use server";

import { redirect } from "next/navigation";
import { changeMemberPassword, clearSession, completeSignupWithVerificationCode, deleteMemberAccount, login, requireSession, sendSignupVerificationCode, setSession, updateMemberProfile } from "@/lib/auth";
import { getFormString } from "@/lib/form-utils";
import { isRedirectError } from "@/lib/redirect-error";

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
            error: result.message ?? "?몄쬆 肄붾뱶 ?꾩넚???ㅽ뙣?덉뒿?덈떎.",
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
          error: result.message ?? "?뚯썝媛?낆뿉 ?ㅽ뙣?덉뒿?덈떎.",
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
        error: "?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??",
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
    const message = encodeURIComponent(result.message ?? "회원정보 수정에 실패했습니다.");
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
    const message = encodeURIComponent(result.message ?? "비밀번호 변경에 실패했습니다.");
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
    const message = encodeURIComponent(result.message ?? "회원 탈퇴에 실패했습니다.");
    redirect(`/guest/account?error=${message}`);
  }

  await clearSession();
  redirect("/auth/login?withdraw=1");
}

export async function logoutAction() {
  await clearSession();
  redirect("/auth/login");
}
