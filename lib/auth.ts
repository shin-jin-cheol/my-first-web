import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { list, put } from "@vercel/blob";

export type UserRole = "owner" | "member";

export type Session = {
  userId: string;
  role: UserRole;
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
  name: string | null;
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

type OwnerMemberView = {
  id: string;
  name: string;
  password: string;
  createdAt: string;
};

const OWNER_ID = "sjc5001";
const OWNER_PASSWORD = "sjc5001*";
const OWNER_NAME = "신진철";
const SESSION_COOKIE = "sjc-session";
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE_LOCAL = path.join(DATA_DIR, "users.json");
const USERS_FILE_TMP = path.join("/tmp", "my-first-web-users.json");
const USERS_BLOB_KEY = "auth/users.json";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_AUTH_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";
const SUPABASE_MEMBERS_TABLE = process.env.SUPABASE_MEMBERS_TABLE || "members";

let usersBlobUrlCache: string | undefined;
let hasTriedSupabaseBootstrap = false;
const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const ownerAccount = Object.freeze({
  id: OWNER_ID,
  password: OWNER_PASSWORD,
  name: OWNER_NAME,
});

function pickLatestBlobUrl(
  blobs: Array<{ url: string; uploadedAt?: string | Date; pathname?: string }>,
) {
  if (blobs.length === 0) {
    return undefined;
  }

  const sorted = [...blobs].sort((a, b) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : Number.MIN_SAFE_INTEGER;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : Number.MIN_SAFE_INTEGER;
    return bTime - aTime;
  });

  return sorted[0]?.url;
}

function resolveUsersFilePath() {
  if (process.env.VERCEL) {
    return USERS_FILE_TMP;
  }

  return USERS_FILE_LOCAL;
}

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function hasSupabaseStorage() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function hasSupabaseAuth() {
  return Boolean(SUPABASE_URL && SUPABASE_AUTH_PUBLIC_KEY);
}

function getSupabaseMembersEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_MEMBERS_TABLE}${query}`;
}

function getSupabaseAuthEndpoint(pathname = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1${pathname}`;
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

function mapSupabaseRowToMember(row: SupabaseMemberRow): MemberRecord {
  return {
    id: row.id,
    name: row.name ?? "",
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
): Promise<{ ok: boolean; data: T | null; message?: string }> {
  const apiKey = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_AUTH_PUBLIC_KEY;

  if (!apiKey) {
    return {
      ok: false,
      data: null,
      message: "Supabase Auth 환경변수가 설정되지 않았습니다.",
    };
  }

  const response = await fetch(getSupabaseAuthEndpoint(pathname), {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return { ok: true, data: null };
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
      data,
      message: parseAuthErrorMessage(data) || "Supabase Auth 요청에 실패했습니다.",
    };
  }

  return { ok: true, data };
}

function decodeSession(value: string): Session | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as Session;

    if (!parsed.userId || (parsed.role !== "owner" && parsed.role !== "member")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function encodeSession(session: Session) {
  return Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
}

async function refreshUsersBlobUrlCache() {
  const existing = await list({ prefix: USERS_BLOB_KEY, limit: 100 });
  const exactPathBlobs = existing.blobs.filter((blob) => blob.pathname === USERS_BLOB_KEY);
  usersBlobUrlCache = pickLatestBlobUrl(exactPathBlobs.length > 0 ? exactPathBlobs : existing.blobs);
}

async function readUsersFromBlob(): Promise<MemberRecord[]> {
  if (!hasBlobStorage()) {
    return [];
  }

  await refreshUsersBlobUrlCache();

  const seed = usersBlobUrlCache
    ? null
    : await put(USERS_BLOB_KEY, JSON.stringify([], null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
      }).catch(() => null);

  if (seed?.url) {
    usersBlobUrlCache = seed.url;
  }

  if (!usersBlobUrlCache) {
    return [];
  }

  const fetchUrl = `${usersBlobUrlCache}${usersBlobUrlCache.includes("?") ? "&" : "?"}ts=${Date.now()}`;
  let response = await fetch(fetchUrl, { cache: "no-store" });

  if (!response.ok) {
    await refreshUsersBlobUrlCache();

    if (!usersBlobUrlCache) {
      return [];
    }

    const retryUrl = `${usersBlobUrlCache}${usersBlobUrlCache.includes("?") ? "&" : "?"}ts=${Date.now()}`;
    response = await fetch(retryUrl, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
  }

  const data = (await response.json()) as Array<Partial<MemberRecord> & { id: string }>;
  return Array.isArray(data) ? data.map(normalizeMemberRecord) : [];
}

async function writeUsersToBlob(members: MemberRecord[]) {
  if (!hasBlobStorage()) {
    return;
  }

  const blob = await put(USERS_BLOB_KEY, JSON.stringify(members, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  usersBlobUrlCache = blob.url;
}

async function ensureUsersFile() {
  if (hasBlobStorage()) {
    await readUsersFromBlob();
    return;
  }

  const usersFilePath = resolveUsersFilePath();

  try {
    await fs.access(usersFilePath);
  } catch {
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
    await fs.writeFile(usersFilePath, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readMembersFromLegacyStorage(): Promise<MemberRecord[]> {
  if (hasBlobStorage()) {
    return readUsersFromBlob();
  }

  await ensureUsersFile();
  const raw = await fs.readFile(resolveUsersFilePath(), "utf-8");
  const parsed = JSON.parse(raw) as Array<Partial<MemberRecord> & { id: string }>;

  return parsed
    .map(normalizeMemberRecord)
    .filter((member) => member.id && member.id !== OWNER_ID);
}

async function writeMembersToLegacyStorage(members: MemberRecord[]) {
  if (hasBlobStorage()) {
    await writeUsersToBlob(members);
    return;
  }

  await fs.writeFile(resolveUsersFilePath(), JSON.stringify(members, null, 2), "utf-8");
}

async function readMembersFromSupabase() {
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

async function readMembers() {
  if (!hasSupabaseStorage()) {
    return readMembersFromLegacyStorage();
  }

  const supabaseMembers = await readMembersFromSupabase();
  if (supabaseMembers.length > 0 || hasTriedSupabaseBootstrap) {
    return supabaseMembers;
  }

  hasTriedSupabaseBootstrap = true;
  const legacyMembers = await readMembersFromLegacyStorage();

  if (legacyMembers.length === 0) {
    return [];
  }

  await upsertMembersToSupabase(legacyMembers);
  return readMembersFromSupabase();
}

async function getMemberById(userId: string) {
  const members = await readMembers();
  return members.find((member) => member.id === userId.trim());
}

async function getMemberByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const members = await readMembers();
  return members.find((member) => member.email?.toLowerCase() === normalizedEmail);
}

async function getMemberByName(name: string) {
  const normalizedName = name.trim();
  const members = await readMembers();
  return members.find((member) => member.name === normalizedName);
}

function isValidSignupPassword(password: string) {
  return PASSWORD_POLICY.test(password);
}

async function saveMember(member: MemberRecord) {
  const normalized = normalizeMemberRecord(member);

  if (hasSupabaseStorage()) {
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

async function deleteMemberById(userId: string) {
  if (hasSupabaseStorage()) {
    await requestSupabaseMembers(
      "DELETE",
      `?id=eq.${encodeURIComponent(userId)}&select=id`,
      undefined,
      "return=representation",
    );
    return;
  }

  const members = await readMembersFromLegacyStorage();
  await writeMembersToLegacyStorage(members.filter((member) => member.id !== userId));
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

async function sendSignupOtpWithSupabase(email: string, id: string, name: string) {
  const result = await requestSupabaseAuth<SupabaseAuthResponse>("POST", "/otp", {
    email,
    create_user: true,
    data: {
      member_id: id,
      name,
    },
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message || "인증 코드 전송에 실패했습니다.",
    };
  }

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

async function verifySignupOtp(email: string, token: string, password: string) {
  const normalizedToken = token.replace(/\D/g, "");

  for (const type of ["email", "magiclink", "signup"] as const) {
    const result = await requestSupabaseAuth<SupabaseAuthResponse>("POST", "/verify", {
      type,
      email,
      token: normalizedToken,
      ...(type === "signup" ? { password } : {}),
    });

    if (result.ok) {
      return result.data;
    }
  }

  return null;
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
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  return decodeSession(raw);
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}

export async function requireOwner(): Promise<Session> {
  const session = await requireSession();

  if (session.role !== "owner") {
    redirect("/guest");
  }

  return session;
}

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
