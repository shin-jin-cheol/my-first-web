'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme | undefined;
  updateTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // localStorage에서 사용자 선택 복원, 없으면 'dark' 기본값
    const storedTheme = (localStorage.getItem('theme') as Theme) || 'dark';
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  function applyTheme(selectedTheme: Theme) {
    const html = document.documentElement;
    const isDark =
      selectedTheme === 'dark' ||
      (selectedTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  useEffect(() => {
    if (!isMounted) return;

    // localStorage에 저장
    localStorage.setItem('theme', theme);
    applyTheme(theme);

    // 'system' 선택 시 OS 설정 변경 감시
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(theme);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, isMounted]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const value: ThemeContextType =  { theme, updateTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
