import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "owner" | "member";

export type Session = {
  userId: string;
  role: UserRole;
};

type Member = {
  id: string;
  password: string;
  createdAt: string;
};

const OWNER_ID = "sjc5001";
const OWNER_PASSWORD = "sjc5001*";
const SESSION_COOKIE = "sjc-session";
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function ensureUsersFile() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readMembers(): Promise<Member[]> {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  return JSON.parse(raw) as Member[];
}

async function writeMembers(members: Member[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(members, null, 2), "utf-8");
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
    return { userId: OWNER_ID, role: "owner" };
  }

  const members = await readMembers();
  const member = members.find((item) => item.id === id && item.password === password);
  if (!member) {
    return null;
  }

  return { userId: member.id, role: "member" };
}

export async function registerMember(id: string, password: string): Promise<{ ok: boolean; message?: string }> {
  if (!id || !password) {
    return { ok: false, message: "아이디와 비밀번호를 입력해 주세요." };
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
