"use client";

import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="rounded-2xl border border-border-base bg-surface-muted/90 p-3 shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.05)] dark:border-border-base dark:bg-surface-sub/75">
      <label htmlFor="post-search" className="sr-only">
        검색
      </label>
      <Input
        id="post-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-base bg-surface-strong px-4 py-2.5 text-sm text-text-base outline-none transition placeholder:text-text-sub focus:border-[var(--accent-primary)] focus:shadow-[0_0_8px_rgb(from_var(--accent-primary)_r_g_b_/_0.08)] dark:border-border-base dark:bg-surface dark:text-text-base dark:placeholder:text-text-subtle"
      />
    </div>
  );
}

