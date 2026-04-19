"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="rounded-2xl border border-zinc-500 bg-zinc-400/90 p-3 shadow-[0_0_18px_rgba(129,216,208,0.12)] dark:border-zinc-600 dark:bg-zinc-900/75">
      <label htmlFor="post-search" className="sr-only">
        검색
      </label>
      <input
        id="post-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-600 bg-zinc-200 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-700 focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)] dark:border-zinc-500 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-400"
      />
    </div>
  );
}

