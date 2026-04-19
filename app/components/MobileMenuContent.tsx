'use client';

import { ThemeToggle } from './ThemeToggle';

interface MobileMenuContentProps {
  locale: 'ko' | 'en';
  children: React.ReactNode;
}

export function MobileMenuContent({ locale, children }: MobileMenuContentProps) {
  return (
    <>
      {children}
      <ThemeToggle />
    </>
  );
}
