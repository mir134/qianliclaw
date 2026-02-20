import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const eventTarget = new EventTarget();

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'system';
  });

  const applyTheme = useCallback((newTheme: Theme) => {
    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', handleSystemThemeChange);

    applyTheme(theme);

    return () => {
      darkModeQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);

      eventTarget.dispatchEvent(
        new CustomEvent('themechange', {
          detail: newTheme,
        })
      );
    },
    [applyTheme]
  );

  useEffect(() => {
    const handler = ((e: CustomEvent) => {
      if (e.detail !== theme) {
        setThemeState(e.detail);
      }
    }) as EventListener;

    eventTarget.addEventListener('themechange', handler);

    return () => {
      eventTarget.removeEventListener('themechange', handler);
    };
  }, [theme]);

  return { theme, setTheme };
}
