'use client';

import { useEffect, useState } from 'react';

export function useLocale(): 'ko' | 'en' {
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');

  useEffect(() => {
    // 쿠키에서 lang 값 추출
    const langCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='))
      ?.split('=')[1];
    
    setLocale((langCookie === 'en' ? 'en' : 'ko') as 'ko' | 'en');
  }, []);

  return locale;
}
