'use client';

import { ThemeToggle } from './ThemeToggle';

interface MobileMenuContentProps {
  locale: 'ko' | 'en';
  children: React.ReactNode;
}

export function MobileMenuContent({ children }: MobileMenuContentProps) {
  return (
    <>
      {children}
      <ThemeToggle />
    </>
  );
}
