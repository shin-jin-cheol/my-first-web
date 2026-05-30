'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/i18n-client';
import { useTheme } from './ThemeProvider';

type Theme = 'light' | 'dark' | 'system';

type ThemeOption = {
  value: Theme;
  label: string;
};

const baseButtonClass = 'rounded-full bg-transparent px-3 py-1.5 text-sm font-medium transition hover:bg-transparent';
const defaultButtonClass = `${baseButtonClass} text-text-sub hover:text-text-base`;
const selectedButtonClass = `${baseButtonClass} bg-[var(--color-background-primary)] text-text-base shadow-[0_1px_4px_rgb(from_var(--color-foreground)_r_g_b_/_0.14)] hover:bg-[var(--color-background-primary)]`;

export function ThemeToggle() {
  const locale = useLocale();
  const { theme, updateTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const resolvedTheme: Theme = theme ?? 'dark';

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const themeOptions: ThemeOption[] = [
    { value: 'light', label: locale === 'ko' ? '라이트' : 'Light' },
    { value: 'dark', label: locale === 'ko' ? '다크' : 'Dark' },
    { value: 'system', label: locale === 'ko' ? '시스템' : 'System' },
  ];

  return (
    <div className="mt-2 space-y-2 border-t border-border-base pt-2 dark:border-border-sub">
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-text-subtle">
        {locale === 'ko' ? '테마' : 'Theme'}
      </p>
      <div className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background-secondary)] p-1">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateTheme(option.value)}
            aria-label={locale === 'ko' ? `${option.label} 테마 선택` : `Select ${option.label} theme`}
            className={mounted && resolvedTheme === option.value ? selectedButtonClass : defaultButtonClass}
          >
            <span className="text-current">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
