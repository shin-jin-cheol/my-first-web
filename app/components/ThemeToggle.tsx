'use client';

import { Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocale } from '@/lib/i18n-client';
import { useTheme } from './ThemeProvider';

type Theme = 'light' | 'dark' | 'system';

type ThemeOption = {
  value: Theme;
  label: string;
  icon: ReactNode;
};

export function ThemeToggle() {
  const locale = useLocale();
  const { theme, updateTheme } = useTheme();

  const resolvedTheme: Theme = theme ?? 'dark';

  const themeOptions: ThemeOption[] = [
    { value: 'light', label: locale === 'ko' ? '라이트' : 'Light', icon: '☼' },
    { value: 'dark', label: locale === 'ko' ? '다크' : 'Dark', icon: '◐' },
    { value: 'system', label: locale === 'ko' ? '시스템' : 'System', icon: <Settings size={14} /> },
  ];

  return (
    <div className="mt-2 space-y-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {locale === 'ko' ? '테마' : 'Theme'}
      </p>
      <div className="flex flex-wrap gap-2">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateTheme(option.value)}
            aria-label={locale === 'ko' ? `${option.label} 테마 선택` : `Select ${option.label} theme`}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              resolvedTheme === option.value
                ? 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:ring-zinc-500'
                : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            <span className="text-current">{option.icon}</span>
            <span className="text-current">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

