'use client';

import { useState } from 'react';

type Locale = 'ko' | 'en';

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') {
    return 'ko';
  }

  const langCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('lang='))
    ?.split('=')[1];

  return langCookie === 'en' ? 'en' : 'ko';
}

export function useLocale(): Locale {
  const [locale] = useState<Locale>(() => getInitialLocale());

  return locale;
}
