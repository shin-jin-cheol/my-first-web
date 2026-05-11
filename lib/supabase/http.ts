import { safeJsonParse } from "@/lib/safe-json";
import { SUPABASE_SERVICE_ROLE_KEY } from "@/lib/env";

type RequestOptions = {
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  prefer?: string;
  parseMode?: "json" | "text"; // "json" = response.json(), "text" = response.text() + safeJsonParse
};

type RequestResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

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
    return { ok: false, status: 500, data: null };
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  const response = await fetch(endpoint, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `requestSupabaseHttp(${endpoint}): response not ok ${response.status} ${response.statusText} ${errorBody}`,
    );
    return { ok: false, status: response.status, data: null };
  }

  if (response.status === 204) {
    return { ok: true, status: response.status, data: null };
  }

  const parseMode = options.parseMode ?? "text";

  if (parseMode === "json") {
    const data = (await response.json()) as T;
    return { ok: true, status: response.status, data };
  }

  // parseMode === "text"
  const raw = await response.text();
  const data = raw.trim() ? safeJsonParse<T>(raw, null) : null;
  return { ok: true, status: response.status, data };
}
