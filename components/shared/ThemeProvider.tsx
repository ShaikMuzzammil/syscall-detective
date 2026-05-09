'use client';

import { useEffect } from 'react';

const THEME_KEY = 'syscall-detective-theme';
const DEFAULT_THEME = 'dark';

export default function ThemeProvider() {
  useEffect(() => {
    const applyTheme = (theme: string) => {
      document.documentElement.dataset.theme = theme;
    };

    applyTheme(localStorage.getItem(THEME_KEY) ?? DEFAULT_THEME);

    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY && event.newValue) applyTheme(event.newValue);
    };

    const onThemeChange = (event: Event) => {
      const theme = (event as CustomEvent<string>).detail;
      if (theme) applyTheme(theme);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('syscall-theme-change', onThemeChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('syscall-theme-change', onThemeChange);
    };
  }, []);

  return null;
}
