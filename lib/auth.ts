import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  userId: string;
  role: "owner" | "member";
  userName?: string;
};

type MemberRecord = {
  id: string;
  name: string;
  password?: string;
  email?: string;
  emailVerified: boolean;
  authUserId?: string;
  createdAt: string;
};

type SupabaseMemberRow = {
  id: string;
  name: string;
  password: string | null;
  email: string | null;
  email_verified: boolean | null;
  auth_user_id: string | null;
  created_at: string;
};

type SupabaseAuthUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: {
    member_id?: string;
    name?: string;
  } | null;
};

type SupabaseAuthResponse = {
  user?: SupabaseAuthUser | null;
  session?: {
    access_token?: string;
    refresh_token?: string;
  } | null;
  error_description?: string;
  msg?: string;
  message?: string;
  error?: string;
};

type AuthResult = {
  ok: boolean;
  message?: string;
};

type MemberProfile = {
  id: string;
  name: string;
  email?: string;
  emailVerified: boolean;
  createdAt: string;
};

type MemberSummary = {
  id: string;
  name: string;
};

type OwnerMemberView = {
  id: string;
  name: string;
  email?: string;
  emailVerified: boolean;
  authProvider: "legacy" | "supabase";
  createdAt: string;
};

const SESSION_COOKIE_NAME = "sjc-session";
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE_LOCAL = path.join(DATA_DIR, "users.json");
const USERS_FILE_TMP = path.join("/tmp", "my-first-web-users.json");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_AUTH_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_MEMBERS_TABLE = process.env.SUPABASE_MEMBERS_TABLE || "members";

let hasTriedSupabaseMembersBootstrap = false;

export const ownerAccount = Object.freeze({
  id: process.env.OWNER_ID || "qwer",
  password: process.env.OWNER_PASSWORD || "qwer",
  name: process.env.OWNER_NAME || "관리자",
});

function resolveUsersFilePath() {
  if (process.env.VERCEL) {
    return USERS_FILE_TMP;
  }

  return USERS_FILE_LOCAL;
}

function hasSupabaseMembersStorage() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function hasSupabaseAuth() {
  return Boolean(SUPABASE_URL && SUPABASE_AUTH_PUBLIC_KEY);
}

function getSupabaseMembersEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  const base = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_MEMBERS_TABLE}`;
  return `${base}${query}`;
}

function getSupabaseAuthEndpoint(pathname = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1${pathname}`;
}

function mapSupabaseRowToMember(row: SupabaseMemberRow): MemberRecord {
  return {
    id: row.id,
    name: row.name,
    password: row.password ?? undefined,
    email: row.email ?? undefined,
    emailVerified: Boolean(row.email_verified),
    authUserId: row.auth_user_id ?? undefined,
    createdAt: row.created_at,
  };
}

function mapMemberToSupabaseRow(member: MemberRecord) {
  return {
    id: member.id,
    name: member.name,
    password: member.password ?? null,
    email: member.email ?? null,
    email_verified: member.emailVerified,
    auth_user_id: member.authUserId ?? null,
    created_at: member.createdAt,
  };
}

function normalizeMemberRecord(input: Partial<MemberRecord> & { id: string }): MemberRecord {
  return {
    id: input.id.trim(),
    name: String(input.name ?? "").trim(),
    password: input.password?.trim() || undefined,
    email: input.email?.trim().toLowerCase() || undefined,
    emailVerified: Boolean(input.emailVerified),
    authUserId: input.authUserId?.trim() || undefined,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function parseAuthErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const candidate = data as Record<string, unknown>;
  const message =
    candidate.error_description ??
    candidate.msg ??
    candidate.message ??
    candidate.error;

  return typeof message === "string" ? message : undefined;
}

async function requestSupabaseMembers<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 500, data: null };
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  if (prefer) {
    headers.Prefer = prefer;
  }

  const response = await fetch(getSupabaseMembersEndpoint(query), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, status: response.status, data: null };
  }

  if (response.status === 204) {
    return { ok: true, status: response.status, data: null };
  }

  const data = (await response.json()) as T;
  return { ok: true, status: response.status, data };
}

async function requestSupabaseAuth<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  pathname: string,
  body?: unknown,
  useServiceRole = false,
  accessToken?: string,
): Promise<{ ok: boolean; status: number; data: T | null; message?: string }> {
  const apiKey = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_AUTH_PUBLIC_KEY;
  const bearerToken = accessToken || apiKey;

  if (!apiKey || !bearerToken) {
    return {
      ok: false,
      status: 500,
      data: null,
      message: "Supabase Auth environment variables are missing.",
    };
  }

  const response = await fetch(getSupabaseAuthEndpoint(pathname), {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return { ok: true, status: response.status, data: null };
  }

  let data: T | null = null;

  try {
    data = (await response.json()) as T;
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
      message: parseAuthErrorMessage(data) || "Supabase Auth request failed.",
    };
  }

  return { ok: true, status: response.status, data };
}

async function ensureUsersFile() {
  const usersFilePath = resolveUsersFilePath();

  try {
    await fs.access(usersFilePath);
  } catch {
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
    await fs.writeFile(usersFilePath, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readMembersFromLegacyStorage(): Promise<MemberRecord[]> {
  await ensureUsersFile();
  const raw = await fs.readFile(resolveUsersFilePath(), "utf-8");
  const parsed = JSON.parse(raw) as Array<Partial<MemberRecord> & { id: string }>;

  return parsed
    .map(normalizeMemberRecord)
    .filter((member) => member.id && member.id !== ownerAccount.id);
}

async function writeMembersToLegacyStorage(members: MemberRecord[]) {
  await fs.writeFile(resolveUsersFilePath(), JSON.stringify(members, null, 2), "utf-8");
}

async function readMembersFromSupabase(): Promise<MemberRecord[]> {
  const result = await requestSupabaseMembers<SupabaseMemberRow[]>(
    "GET",
    "?select=id,name,password,email,email_verified,auth_user_id,created_at&order=created_at.asc",
  );

  if (!result.ok || !Array.isArray(result.data)) {
    return [];
  }

  return result.data.map(mapSupabaseRowToMember);
}

async function upsertMembersToSupabase(members: MemberRecord[]) {
  const rows = members.map(mapMemberToSupabaseRow);

  if (rows.length === 0) {
    return;
  }

  await requestSupabaseMembers(
    "POST",
    "?on_conflict=id",
    rows,
    "resolution=merge-duplicates,return=minimal",
  );
}

async function readMembers(): Promise<MemberRecord[]> {
  if (!hasSupabaseMembersStorage()) {
    return readMembersFromLegacyStorage();
  }

  const supabaseMembers = await readMembersFromSupabase();
  if (supabaseMembers.length > 0 || hasTriedSupabaseMembersBootstrap) {
    return supabaseMembers;
  }

  hasTriedSupabaseMembersBootstrap = true;
  const legacyMembers = await readMembersFromLegacyStorage();
  if (legacyMembers.length === 0) {
    return [];
  }

  await upsertMembersToSupabase(legacyMembers);
  return readMembersFromSupabase();
}

async function getMemberById(id: string) {
  const members = await readMembers();
  return members.find((member) => member.id === id.trim());
}

async function getMemberByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const members = await readMembers();
  return members.find((member) => member.email?.toLowerCase() === normalizedEmail);
}

async function saveMember(member: MemberRecord) {
  const normalized = normalizeMemberRecord(member);

  if (hasSupabaseMembersStorage()) {
    const result = await requestSupabaseMembers<SupabaseMemberRow[]>(
      "POST",
      "?on_conflict=id&select=id,name,password,email,email_verified,auth_user_id,created_at",
      [mapMemberToSupabaseRow(normalized)],
      "resolution=merge-duplicates,return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToMember(result.data[0]);
    }
  }

  const members = await readMembersFromLegacyStorage();
  const index = members.findIndex((item) => item.id === normalized.id);

  if (index === -1) {
    members.push(normalized);
  } else {
    members[index] = normalized;
  }

  await writeMembersToLegacyStorage(members);
  return normalized;
}

async function deleteMemberById(memberId: string) {
  if (hasSupabaseMembersStorage()) {
    await requestSupabaseMembers(
      "DELETE",
      `?id=eq.${encodeURIComponent(memberId)}&select=id`,
      undefined,
      "return=representation",
    );
    return;
  }

  const members = await readMembersFromLegacyStorage();
  const filtered = members.filter((member) => member.id !== memberId);
  await writeMembersToLegacyStorage(filtered);
}

async function signUpWithSupabase(
  email: string,
  password: string,
  id: string,
  name: string,
): Promise<AuthResult> {
  const result = await requestSupabaseAuth<SupabaseAuthResponse>("POST", "/signup", {
    email,
    password,
    data: {
      member_id: id,
      name,
    },
  });

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.message === "User already registered"
          ? "이미 가입된 이메일입니다."
          : "인증 코드 전송에 실패했습니다.",
    };
  }

  return { ok: true };
}

async function verifySignupOtp(email: string, token: string) {
  const attempts: Array<"email" | "signup"> = ["email", "signup"];

  for (const type of attempts) {
    const result = await requestSupabaseAuth<SupabaseAuthResponse>("POST", "/verify", {
      type,
      email,
      token,
    });

    if (result.ok) {
      return result.data;
    }
  }

  return null;
}

async function signInMemberWithSupabase(email: string, password: string) {
  const result = await requestSupabaseAuth<SupabaseAuthResponse>(
    "POST",
    "/token?grant_type=password",
    { email, password },
  );

  if (!result.ok) {
    return null;
  }

  return result.data;
}

async function updateSupabaseAuthUserPassword(authUserId: string, password: string) {
  const result = await requestSupabaseAuth<SupabaseAuthResponse>(
    "PUT",
    `/admin/users/${authUserId}`,
    { password },
    true,
  );

  return result.ok;
}

async function deleteSupabaseAuthUser(authUserId: string) {
  const result = await requestSupabaseAuth<null>(
    "DELETE",
    `/admin/users/${authUserId}`,
    undefined,
    true,
  );

  return result.ok;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Session;
    if (
      typeof parsed?.userId !== "string" ||
      (parsed.role !== "owner" && parsed.role !== "member")
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}

export async function setSession(session: Session) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function login(id: string, password: string): Promise<Session | null> {
  const normalizedId = id.trim();
  const normalizedPassword = password.trim();

  if (!normalizedId || !normalizedPassword) {
    return null;
  }

  if (
    normalizedId === ownerAccount.id &&
    normalizedPassword === ownerAccount.password
  ) {
    return {
      userId: ownerAccount.id,
      role: "owner",
      userName: ownerAccount.name,
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
        emailVerified: Boolean(authUser.email_confirmed_at),
        authUserId: authUser.id,
      });
    }

    return {
      userId: member.id,
      role: "member",
      userName: member.name,
    };
  }

  if (member.password !== normalizedPassword) {
    return null;
  }

  return {
    userId: member.id,
    role: "member",
    userName: member.name,
  };
}

export async function sendSignupVerificationCode(
  id: string,
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedId = id.trim();
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedId || !normalizedName || !normalizedEmail || !normalizedPassword) {
    return {
      ok: false,
      message: "아이디, 이름, 이메일, 비밀번호를 모두 입력해 주세요.",
    };
  }

  if (!hasSupabaseAuth()) {
    return {
      ok: false,
      message: "Supabase Auth 환경변수가 설정되지 않았습니다.",
    };
  }

  if (normalizedId === ownerAccount.id) {
    return {
      ok: false,
      message: "이미 사용 중인 아이디입니다.",
    };
  }

  if (await getMemberById(normalizedId)) {
    return {
      ok: false,
      message: "이미 사용 중인 아이디입니다.",
    };
  }

  if (await getMemberByEmail(normalizedEmail)) {
    return {
      ok: false,
      message: "이미 가입된 이메일입니다.",
    };
  }

  return signUpWithSupabase(
    normalizedEmail,
    normalizedPassword,
    normalizedId,
    normalizedName,
  );
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
  const normalizedCode = verificationCode.trim();

  if (
    !normalizedId ||
    !normalizedName ||
    !normalizedEmail ||
    !normalizedPassword ||
    !normalizedCode
  ) {
    return {
      ok: false,
      message: "회원가입 정보를 모두 입력해 주세요.",
    };
  }

  const verified = await verifySignupOtp(normalizedEmail, normalizedCode);
  const authUser = verified?.user;

  if (!authUser?.id) {
    return {
      ok: false,
      message: "인증 코드가 올바르지 않거나 만료되었습니다.",
    };
  }

  const memberId = authUser.user_metadata?.member_id?.trim() || normalizedId;
  const memberName = authUser.user_metadata?.name?.trim() || normalizedName;

  const existingMember = await getMemberById(memberId);
  if (existingMember && existingMember.authUserId && existingMember.authUserId !== authUser.id) {
    return {
      ok: false,
      message: "이미 사용 중인 아이디입니다.",
    };
  }

  await saveMember({
    id: memberId,
    name: memberName,
    email: normalizedEmail,
    emailVerified: true,
    authUserId: authUser.id,
    password: existingMember?.password,
    createdAt: existingMember?.createdAt || new Date().toISOString(),
  });

  return { ok: true };
}

export async function getMemberProfile(memberId: string): Promise<MemberProfile | null> {
  const member = await getMemberById(memberId);

  if (!member) {
    return null;
  }

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    emailVerified: member.emailVerified,
    createdAt: member.createdAt,
  };
}

export async function getMemberSummaries(): Promise<MemberSummary[]> {
  const members = await readMembers();

  return members.map((member) => ({
    id: member.id,
    name: member.name,
  }));
}

export async function updateMemberProfile(memberId: string, name: string): Promise<AuthResult> {
  const member = await getMemberById(memberId);

  if (!member) {
    return {
      ok: false,
      message: "회원 정보를 찾을 수 없습니다.",
    };
  }

  const nextName = name.trim();
  if (!nextName) {
    return {
      ok: false,
      message: "이름을 입력해 주세요.",
    };
  }

  await saveMember({
    ...member,
    name: nextName,
  });

  return { ok: true };
}

export async function changeMemberPassword(
  memberId: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  const member = await getMemberById(memberId);

  if (!member) {
    return {
      ok: false,
      message: "회원 정보를 찾을 수 없습니다.",
    };
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
    const authData = await signInMemberWithSupabase(
      member.email,
      normalizedCurrentPassword,
    );

    if (!authData?.user?.id) {
      return {
        ok: false,
        message: "현재 비밀번호가 올바르지 않습니다.",
      };
    }

    const updated = await updateSupabaseAuthUserPassword(
      member.authUserId,
      normalizedNewPassword,
    );

    if (!updated) {
      return {
        ok: false,
        message: "비밀번호 변경에 실패했습니다.",
      };
    }

    return { ok: true };
  }

  if (member.password !== normalizedCurrentPassword) {
    return {
      ok: false,
      message: "현재 비밀번호가 올바르지 않습니다.",
    };
  }

  await saveMember({
    ...member,
    password: normalizedNewPassword,
  });

  return { ok: true };
}

export async function deleteMemberAccount(
  memberId: string,
  password: string,
): Promise<AuthResult> {
  const member = await getMemberById(memberId);

  if (!member) {
    return {
      ok: false,
      message: "회원 정보를 찾을 수 없습니다.",
    };
  }

  const normalizedPassword = password.trim();
  if (!normalizedPassword) {
    return {
      ok: false,
      message: "비밀번호를 입력해 주세요.",
    };
  }

  if (member.email && member.authUserId && hasSupabaseAuth()) {
    const authData = await signInMemberWithSupabase(member.email, normalizedPassword);

    if (!authData?.user?.id) {
      return {
        ok: false,
        message: "비밀번호가 올바르지 않습니다.",
      };
    }

    const deleted = await deleteSupabaseAuthUser(member.authUserId);
    if (!deleted) {
      return {
        ok: false,
        message: "회원 탈퇴에 실패했습니다.",
      };
    }

    await deleteMemberById(member.id);
    return { ok: true };
  }

  if (member.password !== normalizedPassword) {
    return {
      ok: false,
      message: "비밀번호가 올바르지 않습니다.",
    };
  }

  await deleteMemberById(member.id);
  return { ok: true };
}

export async function getMembersForOwner(): Promise<OwnerMemberView[]> {
  const session = await requireSession();

  if (session.role !== "owner") {
    redirect("/guest");
  }

  const members = await readMembers();

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    emailVerified: member.emailVerified,
    authProvider: member.authUserId ? "supabase" : "legacy",
    createdAt: member.createdAt,
  }));
}
