import { cookies } from "next/headers";

export type Locale = "ko" | "en";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const lang = store.get("lang")?.value;
  return lang === "en" ? "en" : "ko";
}

export function t(locale: Locale, ko: string, en: string): string {
  return locale === "en" ? en : ko;
}
