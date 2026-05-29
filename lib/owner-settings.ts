import { SUPABASE_OWNER_SETTINGS_TABLE, SUPABASE_URL } from "@/lib/env";
import { requestSupabaseHttp } from "@/lib/supabase/http";

type OwnerSettingRow = {
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
};

function getOwnerSettingsEndpoint(query = "") {
  if (!SUPABASE_URL) {
    return "";
  }

  return `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_OWNER_SETTINGS_TABLE}${query}`;
}

export async function getOwnerAvatarUrl(): Promise<string | null> {
  const result = await requestSupabaseHttp<OwnerSettingRow[]>(getOwnerSettingsEndpoint("?select=value&key=eq.avatar_url&limit=1"), {
    method: "GET",
    parseMode: "json",
  });

  if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
    return null;
  }

  const value = result.data[0]?.value?.trim();
  return value || null;
}

export async function setOwnerAvatarUrl(url: string): Promise<void> {
  const normalizedUrl = url.trim();

  if (!normalizedUrl) {
    throw new Error("Avatar URL is required.");
  }

  const result = await requestSupabaseHttp<OwnerSettingRow[]>(getOwnerSettingsEndpoint("?on_conflict=key&select=key,value,created_at,updated_at"), {
    method: "POST",
    body: [
      {
        key: "avatar_url",
        value: normalizedUrl,
        updated_at: new Date().toISOString(),
      },
    ],
    prefer: "resolution=merge-duplicates,return=representation",
    parseMode: "json",
  });

  if (!result.ok) {
    throw new Error("Failed to update owner avatar.");
  }
}