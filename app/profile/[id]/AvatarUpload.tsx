"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAvatarAction } from "./actions";

type AvatarUploadProps = {
  userId: string;
};

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;

export function AvatarUpload({ userId }: AvatarUploadProps) {
  const router = useRouter();
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

    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("avatar", file);

    setIsUploading(true);
    try {
      await uploadAvatarAction(formData);
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
