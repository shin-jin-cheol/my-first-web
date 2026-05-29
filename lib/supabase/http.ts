import { safeJsonParse } from "@/lib/safe-json";
import { SUPABASE_SERVICE_ROLE_KEY } from "@/lib/env";

type RequestOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  prefer?: string;
  parseMode?: "json" | "text"; // Kept for backward-compatible call sites.
};

type RequestResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Supabase HTTP error";
}

function parseJsonText<T>(raw: string): { ok: true; data: T | null } | { ok: false; error: string } {
  if (!raw.trim()) {
    return { ok: true, data: null };
  }

  const parseFailed = Symbol("parseFailed");
  const data = safeJsonParse<T | typeof parseFailed>(raw, parseFailed);

  if (data === parseFailed) {
    return { ok: false, error: "Failed to parse Supabase HTTP response JSON" };
  }

  return { ok: true, data };
}

/**
 * 공통 Supabase REST API 요청 wrapper
 * 기존 함수들의 중복된 headers/response 처리를 중앙화
 * 
 * @param endpoint 전체 URL (예: "https://project.supabase.co/rest/v1/table?query")
 * @param options method, body, prefer, parseMode
 * @returns ok, status, data
 */
export async function requestSupabaseHttp<T>(
  endpoint: string,
  options: RequestOptions,
): Promise<RequestResult<T>> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("requestSupabaseHttp: SUPABASE_SERVICE_ROLE_KEY is not set");
    return {
      ok: false,
      status: 500,
      data: null,
      error: "SUPABASE_SERVICE_ROLE_KEY is not set",
    };
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  try {
    const response = await fetch(endpoint, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const error = `Supabase HTTP response not ok ${response.status} ${response.statusText} ${errorBody}`;
      console.error(`requestSupabaseHttp(${endpoint}): ${error}`);
      return { ok: false, status: response.status, data: null, error };
    }

    if (response.status === 204) {
      return { ok: true, status: response.status, data: null };
    }

    // Parse from text so JSON parse errors can preserve the response status.
    const raw = await response.text();
    const parsed = parseJsonText<T>(raw);

    if (!parsed.ok) {
      console.error(`requestSupabaseHttp(${endpoint}): ${parsed.error}`);
      return { ok: false, status: response.status, data: null, error: parsed.error };
    }

    return { ok: true, status: response.status, data: parsed.data };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error(`requestSupabaseHttp(${endpoint}): ${message}`);
    return { ok: false, status: 0, data: null, error: message };
  }
}
