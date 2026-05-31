"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { resizeImageForUpload } from "@/lib/image-resize";

type PostImageUploaderProps = {
  userId: string;
  bucketName: string;
  fieldName: string;
  label: string;
  helperText: string;
  uploadText: string;
  uploadingText: string;
  removeText: string;
  emptyText: string;
  previewAlt: string;
  initialImageUrl?: string | null;
};

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

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

export function PostImageUploader({
  userId,
  bucketName,
  fieldName,
  label,
  helperText,
  uploadText,
  uploadingText,
  removeText,
  emptyText,
  previewAlt,
  initialImageUrl,
}: PostImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl ?? "");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const sourceFile = event.target.files?.[0];
    setMessage("");

    if (!sourceFile) {
      return;
    }

    if (!sourceFile.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (sourceFile.size > MAX_IMAGE_SIZE_BYTES) {
      setMessage("이미지는 10MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    let uploadFile = sourceFile;

    try {
      uploadFile = await resizeImageForUpload(sourceFile);
    } catch (resizeError) {
      setMessage(resizeError instanceof Error ? resizeError.message : "이미지 리사이징에 실패했습니다.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(uploadFile);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const path = `${userId}/${Date.now()}.${getFileExtension(uploadFile)}`;
      const { error } = await supabase.storage.from(bucketName).upload(path, uploadFile, {
        contentType: uploadFile.type || "application/octet-stream",
        upsert: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setPreviewUrl(data.publicUrl);
    } catch (uploadError) {
      setMessage(uploadError instanceof Error ? uploadError.message : "이미지 업로드에 실패했습니다.");
      setPreviewUrl(imageUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function handleRemove() {
    setMessage("");
    setImageUrl("");
    setPreviewUrl("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border-base bg-surface-sub/80 p-4 dark:border-border-sub dark:bg-surface-strong/80">
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-sub dark:text-text-base">{label}</p>
        <p className="text-xs leading-5 text-text-muted dark:text-text-subtle">{helperText}</p>
      </div>

      <input type="hidden" name={fieldName} value={imageUrl} />

      <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border-base bg-surface-strong px-4 py-2 text-sm font-semibold text-text-sub transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-sub dark:bg-surface-sub dark:text-text-base dark:hover:bg-surface-muted">
        <span>{isUploading ? uploadingText : uploadText}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isUploading}
          onChange={handleChange}
        />
      </label>

      {imageUrl ? (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isUploading}
          className="ml-3 rounded-full border border-border-base bg-surface px-4 py-2 text-sm font-medium text-text-sub transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-sub dark:bg-surface-sub dark:text-text-base dark:hover:bg-surface-muted"
        >
          {removeText}
        </button>
      ) : null}

      {message ? <p className="text-sm text-danger-sub">{message}</p> : null}

      {previewUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border-base bg-surface-muted dark:border-border-sub dark:bg-surface-sub">
          <Image src={previewUrl} alt={previewAlt} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border-base bg-surface-muted px-4 py-6 text-sm text-text-muted dark:border-border-sub dark:bg-surface-sub dark:text-text-subtle">
          {emptyText}
        </div>
      )}
    </div>
  );
}