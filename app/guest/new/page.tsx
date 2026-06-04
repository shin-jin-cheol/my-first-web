import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { GUEST_POST_CATEGORIES, getCategoryLabel } from "@/lib/post-categories";
import { safeDecodeURIComponent } from "@/lib/safe-decode";
import { getLocale, t, tk } from "@/lib/i18n";
import { SUPABASE_POST_IMAGES_BUCKET } from "@/lib/env";
import { createGuestPost } from "@/app/guest/actions";
import { GuestNewForm } from "@/app/components/GuestNewForm";
type NewGuestPostPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewGuestPostPage({ searchParams }: NewGuestPostPageProps) {
  const [locale, session] = await Promise.all([getLocale(), requireSession()]);
  if (session.role !== "member") {
    redirect("/guest");
  }

  const params = await searchParams;
  const errorMessage = params.error ? safeDecodeURIComponent(params.error) : "";

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted dark:text-text-subtle">
          Guest Write
        </p>
        <h1 className="text-4xl font-extrabold text-text-sub dark:text-text-base drop-shadow-[0_0_6px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)]">
          {tk(locale, "writeGuestPost")}
        </h1>
      </header>

      {errorMessage ? (
        <p className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-sub">
          {errorMessage}
        </p>
      ) : null}

      <GuestNewForm
        action={createGuestPost}
        errorMessage={errorMessage}
        storageKey="draft_guest_post"
        cancelHref="/guest"
        categoryOptions={GUEST_POST_CATEGORIES.map((category) => ({ value: category, label: getCategoryLabel(category) }))}
        userId={session.userId}
        bucketName={SUPABASE_POST_IMAGES_BUCKET}
        titleLabel={tk(locale, "title")}
        contentLabel={tk(locale, "content")}
        linkLabel={tk(locale, "linkUrlOptional")}
        youtubeLabel={t(locale, "YouTube 영상 URL (선택)", "YouTube video URL (optional)")}
        fileLabel={tk(locale, "uploadFileOptional")}
        submitLabel={tk(locale, "publish")}
        cancelLabel={tk(locale, "cancel")}
        imageLabel={t(locale, "게시글 이미지", "Post Image")}
        imageHelperText={t(locale, "이미지는 10MB 이하만 업로드할 수 있습니다.", "Images must be 10MB or smaller.")}
        imageUploadText={t(locale, "이미지 첨부", "Attach Image")}
        imageUploadingText={t(locale, "업로드 중...", "Uploading...")}
        imageRemoveText={t(locale, "이미지 제거", "Remove Image")}
        imageEmptyText={t(locale, "첨부된 이미지가 없습니다.", "No image attached.")}
        imagePreviewAlt={t(locale, "게시글 이미지 미리보기", "Post image preview")}
      />
    </section>
  );
}
