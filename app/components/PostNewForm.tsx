"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostImageUploader } from "@/app/components/PostImageUploader";

type CategoryOption = {
  value: string;
  label: string;
};

type PostNewFormProps = {
  action: (formData: FormData) => Promise<void>;
  errorMessage: string;
  storageKey: string;
  cancelHref: string;
  categoryOptions: CategoryOption[];
  userId: string;
  bucketName: string;
  titleLabel: string;
  authorLabel: string;
  contentLabel: string;
  linkLabel: string;
  fileLabel: string;
  submitLabel: string;
  cancelLabel: string;
  imageLabel: string;
  imageHelperText: string;
  imageUploadText: string;
  imageUploadingText: string;
  imageRemoveText: string;
  imageEmptyText: string;
  imagePreviewAlt: string;
};

type DraftValue = {
  title: string;
  content: string;
};

function readDraft(storageKey: string): DraftValue {
  if (typeof window === "undefined") {
    return { title: "", content: "" };
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return { title: "", content: "" };
    }

    const parsedValue = JSON.parse(rawValue) as Partial<DraftValue>;
    return {
      title: typeof parsedValue.title === "string" ? parsedValue.title : "",
      content: typeof parsedValue.content === "string" ? parsedValue.content : "",
    };
  } catch {
    return { title: "", content: "" };
  }
}

function writeDraft(storageKey: string, draft: DraftValue) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch {
    // Ignore storage failures.
  }
}

function clearDraft(storageKey: string) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage failures.
  }
}

export function PostNewForm({
  action,
  errorMessage,
  storageKey,
  cancelHref,
  categoryOptions,
  userId,
  bucketName,
  titleLabel,
  authorLabel,
  contentLabel,
  linkLabel,
  fileLabel,
  submitLabel,
  cancelLabel,
  imageLabel,
  imageHelperText,
  imageUploadText,
  imageUploadingText,
  imageRemoveText,
  imageEmptyText,
  imagePreviewAlt,
}: PostNewFormProps) {
  const [category, setCategory] = useState(categoryOptions[0]?.value ?? "study");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const draft = readDraft(storageKey);
      setTitle(draft.title);
      setContent(draft.content);
      setDraftReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [storageKey]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      writeDraft(storageKey, { title, content });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [content, draftReady, storageKey, title]);

  function handleSubmit() {
    clearDraft(storageKey);
  }

  function handleCancel() {
    clearDraft(storageKey);
  }

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-sub">
          {errorMessage}
        </p>
      ) : null}

      <form action={action} onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border-base bg-surface p-6 shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] dark:border-border-base dark:bg-surface-strong">
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium text-text-sub dark:text-text-sub">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none transition focus:border-[var(--accent-primary)] dark:border-border-sub dark:bg-surface-sub dark:text-text-base dark:[color-scheme:dark] dark:[&>option]:bg-surface-sub dark:[&>option]:text-text-base"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value} style={{ color: "var(--foreground)", background: "var(--background)" }}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-text-sub dark:text-text-sub">
          {titleLabel}
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={titleLabel}
          className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none transition focus:border-[var(--accent-primary)] dark:border-border-sub dark:bg-surface-sub dark:text-text-base"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="author" className="text-sm font-medium text-text-sub dark:text-text-sub">
          {authorLabel}
        </label>
        <Input
          id="author"
          name="author"
          type="text"
          required
          placeholder={authorLabel}
          className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none transition focus:border-[var(--accent-primary)] dark:border-border-sub dark:bg-surface-sub dark:text-text-base"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-text-sub dark:text-text-sub">
          {contentLabel}
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={contentLabel}
          className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-3 text-text-sub outline-none transition focus:border-[var(--accent-primary)] dark:border-border-sub dark:bg-surface-sub dark:text-text-base"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="linkUrl" className="text-sm font-medium text-text-sub dark:text-text-sub">
          {linkLabel}
        </label>
        <Input
          id="linkUrl"
          name="linkUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="https://example.com"
          className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none transition focus:border-[var(--accent-primary)] dark:border-border-sub dark:bg-surface-sub dark:text-text-base"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="attachment" className="text-sm font-medium text-text-sub dark:text-text-sub">
          {fileLabel}
        </label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          className="min-h-12 w-full rounded-xl border border-border-base bg-surface-sub px-4 py-3 text-sm text-text-sub file:mr-4 file:rounded-full file:border-0 file:bg-surface-strong file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-text-sub hover:file:bg-surface-muted dark:border-border-sub dark:bg-surface-sub dark:text-text-base dark:file:bg-surface-sub dark:file:text-text-base dark:hover:file:bg-surface-muted"
        />
      </div>

      <PostImageUploader
        userId={userId}
        bucketName={bucketName}
        fieldName="imageUrl"
        label={imageLabel}
        helperText={imageHelperText}
        uploadText={imageUploadText}
        uploadingText={imageUploadingText}
        removeText={imageRemoveText}
        emptyText={imageEmptyText}
        previewAlt={imagePreviewAlt}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          className="rounded-full border border-[var(--accent-light)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-text-base shadow-[0_0_12px_rgb(from_var(--accent-primary)_r_g_b_/_0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-light-sub)]"
        >
          {submitLabel}
        </Button>
        <Link
          href={cancelHref}
          onClick={handleCancel}
          className="rounded-full border border-border-base bg-surface-strong px-4 py-2 text-sm font-medium text-text-sub transition hover:bg-surface-muted dark:border-border-strong dark:bg-surface-sub dark:text-text-base dark:hover:bg-surface-strong"
        >
          {cancelLabel}
        </Link>
      </div>
      </form>
    </div>
  );
}