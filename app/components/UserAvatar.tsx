import Image from "next/image";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
};

export function UserAvatar({ name, avatarUrl, size = 36 }: UserAvatarProps) {
  const displayName = name.trim() || "?";
  const initial = displayName.slice(0, 1).toUpperCase();
  const pixelSize = Math.max(24, size);

  if (avatarUrl) {
    return (
      <span
        className="relative inline-flex shrink-0 overflow-hidden rounded-full border border-border-base bg-surface-sub"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <Image
          src={avatarUrl}
          alt={`${displayName} avatar`}
          fill
          sizes={`${pixelSize}px`}
          className="object-cover"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-border-base text-sm font-bold"
      style={{
        width: pixelSize,
        height: pixelSize,
        backgroundColor: "var(--accent-soft)",
        color: "var(--accent-dark)",
        fontSize: Math.max(14, Math.round(pixelSize * 0.4)),
      }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
