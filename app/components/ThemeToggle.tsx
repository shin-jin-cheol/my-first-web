'use client';

import { Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/i18n-client';
import { useTheme } from './ThemeProvider';

type Theme = 'light' | 'dark' | 'system';

type ThemeOption = {
  value: Theme;
  label: string;
  icon: ReactNode;
};

const baseButtonClass = 'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition';
const defaultButtonClass = `${baseButtonClass} bg-surface text-text-sub hover:bg-surface-sub hover:text-text-base dark:bg-surface-sub dark:text-text-sub dark:hover:bg-surface-strong dark:hover:text-text-base`;
const selectedButtonClass = `${baseButtonClass} bg-surface-sub text-text-base ring-1 ring-border-base dark:bg-surface-strong dark:text-text-base dark:ring-border-strong`;

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
    { value: 'light', label: locale === 'ko' ? '라이트' : 'Light', icon: '☼' },
    { value: 'dark', label: locale === 'ko' ? '다크' : 'Dark', icon: '◐' },
    { value: 'system', label: locale === 'ko' ? '시스템' : 'System', icon: <Settings size={14} /> },
  ];

  return (
    <div className="mt-2 space-y-2 border-t border-border-base pt-2 dark:border-border-sub">
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-text-subtle">
        {locale === 'ko' ? '테마' : 'Theme'}
      </p>
      <div className="flex flex-wrap gap-2">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateTheme(option.value)}
            aria-label={locale === 'ko' ? `${option.label} 테마 선택` : `Select ${option.label} theme`}
            className={mounted && resolvedTheme === option.value ? selectedButtonClass : defaultButtonClass}
          >
            <span className="text-current">{option.icon}</span>
            <span className="text-current">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
