import {
  OWNER_ID,
  OWNER_NAME,
  OWNER_PASSWORD,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_AUTH_PUBLIC_KEY,
  SUPABASE_MEMBERS_TABLE,
} from "@/lib/env";
import { requestSupabaseHttp } from "@/lib/supabase/http";
import { hasSupabaseStorage, readJsonStorage, writeJsonStorage } from "@/lib/storage";

export { OWNER_ID, OWNER_NAME, OWNER_PASSWORD };

export type MemberRecord = {
  id: string;
  name: string;
  password?: string;
  email?: string;
  emailVerified: boolean;
  authUserId?: string;
  avatarUrl?: string | null;
  createdAt: string;
};

type SupabaseMemberRow = {
  id: string;
  name: string | null;
  password: string | null;
  email: string | null;
  email_verified: boolean | null;
  auth_user_id: string | null;
  avatar_url: string | null;
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

export type SupabaseAuthResponse = {
  user?: SupabaseAuthUser | null;
  session?: {
    access_token?: string;
  } | null;
  error_description?: string;
  msg?: string;
  message?: string;
  error?: string;
};

export type AuthResult = {
  ok: boolean;
  message?: string;
};

export type OwnerMemberView = {
  id: string;
  name: string;
  password: string;
  createdAt: string;
};

const USERS_BLOB_KEY = "auth/users.json";
// SUPABASE_* and blob token are centralized in lib/env.ts

let hasTriedSupabaseBootstrap = false;
const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const ownerAccount = Object.freeze({
  id: OWNER_ID,
  password: OWNER_PASSWORD,
  name: OWNER_NAME,
});

export function hasSupabaseAuth() {
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
    avatarUrl: row.avatar_url ?? undefined,
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
    avatar_url: member.avatarUrl ?? null,
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
    avatarUrl: input.avatarUrl?.trim() || undefined,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

// requestSupabaseMembers: centralized to lib/supabase/http.ts
async function requestSupabaseMembers<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  query: string,
  body?: unknown,
  prefer?: string,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  // Use common HTTP wrapper with parseMode="json" for backward compatibility
  return requestSupabaseHttp<T>(getSupabaseMembersEndpoint(query), {
    method,
    body,
    prefer,
    parseMode: "json",
  });
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
      message: "Supabase Auth \ud658\uacbd\ubcc0\uc218\uac00 \uc124\uc815\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4.",
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
      message: parseAuthErrorMessage(data) || "Supabase Auth \uc694\uccad\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.",
    };
  }

  return { ok: true, data };
}

async function readMembersFromLegacyStorage(): Promise<MemberRecord[]> {
  return readJsonStorage({
    blobKey: USERS_BLOB_KEY,
    localFileName: "users.json",
    tmpFileName: "my-first-web-users.json",
    seedData: [] as Array<Partial<MemberRecord> & { id: string }>,
    normalize: (members) =>
      (Array.isArray(members) ? members : [])
        .map(normalizeMemberRecord)
        .filter((member) => member.id && member.id !== OWNER_ID),
    useBlob: true,
    logPrefix: "readUsersFromBlob",
  });
}

async function writeMembersToLegacyStorage(members: MemberRecord[]) {
  await writeJsonStorage(members, {
    blobKey: USERS_BLOB_KEY,
    localFileName: "users.json",
    tmpFileName: "my-first-web-users.json",
    seedData: [] as MemberRecord[],
    useBlob: true,
  });
}

async function readMembersFromSupabase() {
  const result = await requestSupabaseMembers<SupabaseMemberRow[]>(
    "GET",
    "?select=id,name,password,email,email_verified,auth_user_id,avatar_url,created_at&order=created_at.asc",
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

export async function readMembers() {
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

export async function getMemberById(userId: string) {
  const members = await readMembers();
  return members.find((member) => member.id === userId.trim());
}

export async function getMemberByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const members = await readMembers();
  return members.find((member) => member.email?.toLowerCase() === normalizedEmail);
}

export async function getMemberByName(name: string) {
  const normalizedName = name.trim();
  const members = await readMembers();
  return members.find((member) => member.name === normalizedName);
}

export function isValidSignupPassword(password: string) {
  return PASSWORD_POLICY.test(password);
}

export async function saveMember(member: MemberRecord) {
  const normalized = normalizeMemberRecord(member);

  if (hasSupabaseStorage()) {
    const result = await requestSupabaseMembers<SupabaseMemberRow[]>(
      "POST",
      "?on_conflict=id&select=id,name,password,email,email_verified,auth_user_id,avatar_url,created_at",
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

export async function updateMemberAvatarUrl(userId: string, avatarUrl: string) {
  const normalizedUserId = userId.trim();
  const normalizedAvatarUrl = avatarUrl.trim();

  if (!normalizedUserId || !normalizedAvatarUrl) {
    throw new Error("Invalid avatar update request.");
  }

  if (hasSupabaseStorage()) {
    const result = await requestSupabaseMembers<SupabaseMemberRow[]>(
      "PATCH",
      `?id=eq.${encodeURIComponent(normalizedUserId)}&select=id,name,password,email,email_verified,auth_user_id,avatar_url,created_at`,
      { avatar_url: normalizedAvatarUrl },
      "return=representation",
    );

    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      return mapSupabaseRowToMember(result.data[0]);
    }

    throw new Error("Failed to update avatar.");
  }

  const members = await readMembersFromLegacyStorage();
  const index = members.findIndex((member) => member.id === normalizedUserId);

  if (index === -1) {
    throw new Error("Member not found.");
  }

  members[index] = {
    ...members[index],
    avatarUrl: normalizedAvatarUrl,
  };

  await writeMembersToLegacyStorage(members);
  return members[index];
}

export async function deleteMemberById(userId: string) {
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

export async function signInMemberWithSupabase(email: string, password: string) {
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

export async function sendSignupOtpWithSupabase(email: string, id: string, name: string) {
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
      message: result.message || "?? ?? ??? ??????.",
    };
  }

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.message === "User already registered"
          ? "?? ??? ??????."
          : "?? ?? ??? ??????.",
    };
  }

  return { ok: true };
}

export async function verifySignupOtp(email: string, token: string, password: string) {
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

export async function updateSupabaseAuthUserPassword(authUserId: string, password: string) {
  const result = await requestSupabaseAuth<SupabaseAuthResponse>(
    "PUT",
    `/admin/users/${authUserId}`,
    { password },
    true,
  );

  return result.ok;
}

export async function deleteSupabaseAuthUser(authUserId: string) {
  const result = await requestSupabaseAuth<null>(
    "DELETE",
    `/admin/users/${authUserId}`,
    undefined,
    true,
  );

  return result.ok;
}

