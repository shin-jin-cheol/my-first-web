import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_SECRET } from "@/lib/env";
import { safeJsonParse } from "@/lib/safe-json";

export type UserRole = "owner" | "member";

export type Session = {
  userId: string;
  role: UserRole;
  userName?: string;
};
const SESSION_COOKIE = "sjc-session";

function signSessionPayload(payload: string) {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required for session signing.");
  }

  return createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

function verifySessionSignature(payload: string, signature: string) {
  if (!SESSION_SECRET) {
    return false;
  }

  const expected = signSessionPayload(payload);
  const expectedBuffer = Buffer.from(expected, "base64url");
  const signatureBuffer = Buffer.from(signature, "base64url");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function decodeSession(value: string): Session | null {
  try {
    const [payload, signature] = value.split(".");

    if (!payload || !signature || !verifySessionSignature(payload, signature)) {
      return null;
    }

    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = safeJsonParse<Session>(json, null);

    if (!parsed) return null;

    if (!parsed.userId || (parsed.role !== "owner" && parsed.role !== "member")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function encodeSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
  return `${payload}.${signSessionPayload(payload)}`;
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
