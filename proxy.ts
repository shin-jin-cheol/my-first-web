import { NextResponse, type NextRequest } from "next/server";
import { SESSION_SECRET } from "@/lib/env";

const SESSION_COOKIE = "sjc-session";

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeToString(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function signSessionPayload(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return base64UrlEncode(new Uint8Array(signature));
}

function isValidSessionPayload(payload: string) {
  try {
    const parsed = JSON.parse(base64UrlDecodeToString(payload)) as {
      userId?: unknown;
      role?: unknown;
    };

    return Boolean(
      parsed.userId &&
        typeof parsed.userId === "string" &&
        (parsed.role === "owner" || parsed.role === "member"),
    );
  } catch {
    return false;
  }
}

async function verifySessionCookie(value: string) {
  if (!SESSION_SECRET) {
    return false;
  }

  try {
    const [payload, signature] = value.split(".");

    if (!payload || !signature) {
      return false;
    }

    const expected = await signSessionPayload(payload);
    return constantTimeEqual(expected, signature) && isValidSessionPayload(payload);
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (sessionCookie && (await verifySessionCookie(sessionCookie))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: ["/posts/new", "/guest/new", "/guest/account", "/admin/:path*", "/friends", "/chat/:path*"],
};
