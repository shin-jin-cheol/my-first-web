export function safeJsonParse<T>(json: string, fallback: T | null): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
