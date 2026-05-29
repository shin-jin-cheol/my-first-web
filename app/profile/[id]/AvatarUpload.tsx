"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { saveAvatarUrlAction } from "./actions";

type AvatarUploadProps = {
  userId: string;
};

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;

function getFileExtension(file: File) {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/gif") {
    return "gif";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "bin";
}

export function AvatarUpload({ userId }: AvatarUploadProps) {
  const router = useRouter();
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setMessage("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setMessage("프로필 이미지는 10MB 이하만 가능합니다.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const path = `${userId}/${Date.now()}.${getFileExtension(file)}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await saveAvatarUrlAction(data.publicUrl);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="inline-flex cursor-pointer text-sm font-semibold text-text-sub transition hover:text-text-base hover:underline">
        <span>{isUploading ? "업로드 중..." : "프로필 이미지 변경"}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isUploading}
          onChange={handleChange}
        />
      </label>
      {message ? <p className="text-sm text-danger-sub">{message}</p> : null}
    </div>
  );
}
