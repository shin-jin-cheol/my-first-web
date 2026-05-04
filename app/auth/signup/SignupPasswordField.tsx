"use client";

import { useState } from "react";

type SignupPasswordFieldProps = {
  label: string;
  title: string;
  helperText: string;
  lengthText: string;
  letterText: string;
  numberText: string;
  specialText: string;
};

function RuleItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={ok ? "text-success dark:text-success-sub" : "text-text-muted dark:text-text-muted"}>
      {ok ? "OK" : "·"} {text}
    </li>
  );
}

export default function SignupPasswordField({
  label,
  title,
  helperText,
  lengthText,
  letterText,
  numberText,
  specialText,
}: SignupPasswordFieldProps) {
  const [value, setValue] = useState("");

  const hasLength = value.length >= 8;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^A-Za-z\d]/.test(value);

  return (
    <div className="space-y-2">
      <label htmlFor="password" className="text-sm text-text-sub dark:text-text-sub">
        {label}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        minLength={8}
        pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$"
        title={title}
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-xl border border-border-base bg-surface-sub px-4 py-2.5 text-text-sub outline-none focus:border-[#81d8d0] dark:border-border-base dark:bg-surface-sub dark:text-text-base"
      />
      <p className="text-xs text-text-muted dark:text-text-muted">{helperText}</p>
      <ul className="grid gap-1 text-xs">
        <RuleItem ok={hasLength} text={lengthText} />
        <RuleItem ok={hasLetter} text={letterText} />
        <RuleItem ok={hasNumber} text={numberText} />
        <RuleItem ok={hasSpecial} text={specialText} />
      </ul>
    </div>
  );
}
