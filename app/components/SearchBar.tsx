"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-800/80 p-3 shadow-[0_0_18px_rgba(129,216,208,0.12)]">
      <label htmlFor="post-search" className="sr-only">
        검색
      </label>
      <input
        id="post-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#81d8d0] focus:shadow-[0_0_14px_rgba(129,216,208,0.35)]"
      />
    </div>
  );
}
