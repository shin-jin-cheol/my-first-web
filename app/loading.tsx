export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span
        className="block h-10 w-10 animate-spin rounded-full border-4 border-surface-strong border-t-[var(--accent)]"
        role="status"
        aria-label="페이지를 불러오는 중"
      />
    </div>
  );
}
