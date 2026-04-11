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

type Member = {
  id: string;
  name?: string;
  password: string;
  createdAt: string;
};

const OWNER_ID = "sjc5001";
const OWNER_PASSWORD = "sjc5001*";
const SESSION_COOKIE = "sjc-session";
const USERS_FILE_LOCAL = path.join(process.cwd(), "data", "users.json");
const USERS_FILE_TMP = path.join("/tmp", "my-first-web-users.json");
const USERS_BLOB_KEY = "auth/users.json";

let usersBlobUrlCache: string | undefined;

function pickLatestBlobUrl(blobs: Array<{ url: string; uploadedAt?: string | Date }>): string | undefined {
  if (blobs.length === 0) {
    return undefined;
  }

  const sorted = [...blobs].sort((a, b) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return bTime - aTime;
  });

  return sorted[0]?.url;
}

function resolveUsersFilePath() {
  // Vercel deployment filesystem is read-only except /tmp.
  if (process.env.VERCEL) {
    return USERS_FILE_TMP;
  }
  return USERS_FILE_LOCAL;
}

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function refreshUsersBlobUrlCache() {
  const existing = await list({ prefix: USERS_BLOB_KEY, limit: 100 });
  usersBlobUrlCache = pickLatestBlobUrl(existing.blobs);
}

async function readUsersFromBlob(): Promise<Member[]> {
  if (!hasBlobStorage()) {
    return [];
  }

  if (!usersBlobUrlCache) {
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
  }

  if (!usersBlobUrlCache) {
    return [];
  }

  const fetchUrl = usersBlobUrlCache;
  let response = await fetch(fetchUrl, { cache: "no-store" });
  if (!response.ok) {
    await refreshUsersBlobUrlCache();

    if (!usersBlobUrlCache) {
      return [];
    }

    response = await fetch(usersBlobUrlCache, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
  }

  const data = (await response.json()) as Member[];
  return Array.isArray(data) ? data : [];
}

async function writeUsersToBlob(members: Member[]) {
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

async function readMembers(): Promise<Member[]> {
  if (hasBlobStorage()) {
    return readUsersFromBlob();
  }

  await ensureUsersFile();
  const raw = await fs.readFile(resolveUsersFilePath(), "utf-8");
  return JSON.parse(raw) as Member[];
}

async function writeMembers(members: Member[]) {
  if (hasBlobStorage()) {
    await writeUsersToBlob(members);
    return;
  }

  await fs.writeFile(resolveUsersFilePath(), JSON.stringify(members, null, 2), "utf-8");
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

function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
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
  if (id === OWNER_ID && password === OWNER_PASSWORD) {
    return { userId: OWNER_ID, role: "owner", userName: "신진철" };
  }

  const members = await readMembers();
  const member = members.find((item) => item.id === id && item.password === password);
  if (!member) {
    return null;
  }

  return {
    userId: member.id,
    role: "member",
    userName: member.name?.trim() || member.id,
  };
}

export async function registerMember(id: string, name: string, password: string): Promise<{ ok: boolean; message?: string }> {
  if (!id || !name || !password) {
    return { ok: false, message: "이름, 아이디, 비밀번호를 입력해 주세요." };
  }

  if (id === OWNER_ID) {
    return { ok: false, message: "사용할 수 없는 아이디입니다." };
  }

  const members = await readMembers();
  if (members.some((member) => member.id === id)) {
    return { ok: false, message: "이미 존재하는 아이디입니다." };
  }

  members.push({
    id,
    name,
    password,
    createdAt: new Date().toISOString(),
  });
  await writeMembers(members);
  return { ok: true };
}

export async function getMembersForOwner(): Promise<Member[]> {
  await requireOwner();
  return readMembers();
}

export async function getMemberSummaries(): Promise<Array<{ id: string; name: string }>> {
  const members = await readMembers();
  return members.map((member) => ({
    id: member.id,
    name: member.name ?? "",
  }));
}

export async function getMemberProfile(userId: string): Promise<{ id: string; name: string; createdAt: string } | null> {
  if (!userId || userId === OWNER_ID) {
    return null;
  }

  const members = await readMembers();
  const member = members.find((item) => item.id === userId);
  if (!member) {
    return null;
  }

  return {
    id: member.id,
    name: member.name ?? "",
    createdAt: member.createdAt,
  };
}

export async function updateMemberProfile(userId: string, name: string): Promise<{ ok: boolean; message?: string }> {
  if (!userId || userId === OWNER_ID) {
    return { ok: false, message: "회원 계정만 수정할 수 있습니다." };
  }

  if (!name) {
    return { ok: false, message: "이름을 입력해 주세요." };
  }

  const members = await readMembers();
  const index = members.findIndex((member) => member.id === userId);

  if (index === -1) {
    return { ok: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  members[index] = {
    ...members[index],
    name,
  };
  await writeMembers(members);

  return { ok: true };
}

export async function changeMemberPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!userId || userId === OWNER_ID) {
    return { ok: false, message: "회원 계정만 비밀번호 변경이 가능합니다." };
  }

  if (!currentPassword || !newPassword) {
    return { ok: false, message: "현재 비밀번호와 새 비밀번호를 입력해 주세요." };
  }

  const members = await readMembers();
  const index = members.findIndex((member) => member.id === userId && member.password === currentPassword);

  if (index === -1) {
    return { ok: false, message: "현재 비밀번호가 올바르지 않습니다." };
  }

  members[index] = {
    ...members[index],
    password: newPassword,
  };
  await writeMembers(members);

  return { ok: true };
}

export async function deleteMemberAccount(
  userId: string,
  password: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!userId || userId === OWNER_ID) {
    return { ok: false, message: "회원 계정만 탈퇴할 수 있습니다." };
  }

  if (!password) {
    return { ok: false, message: "비밀번호를 입력해 주세요." };
  }

  const members = await readMembers();
  const filtered = members.filter((member) => !(member.id === userId && member.password === password));

  if (filtered.length === members.length) {
    return { ok: false, message: "비밀번호가 올바르지 않습니다." };
  }

  await writeMembers(filtered);
  return { ok: true };
}

export const ownerAccount = {
  id: OWNER_ID,
  password: OWNER_PASSWORD,
};
