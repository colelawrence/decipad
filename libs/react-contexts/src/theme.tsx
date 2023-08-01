import { useCallback, useEffect, useMemo } from 'react';
import {
  THEME_PREFERENCE_LOCAL_STORAGE_KEY,
  noop,
  themeStore,
} from '@decipad/utils';

export type ThemePreference = 'system' | 'light' | 'dark';

const getItem =
  'localStorage' in global
    ? global.localStorage.getItem.bind(global.localStorage)
    : (_key: string) => false;
const setItem =
  'localStorage' in global
    ? global.localStorage.setItem.bind(global.localStorage)
    : noop;

const isSystemThemeDark = (): boolean => {
  if (!('matchMedia' in global)) {
    return false;
  }

  return matchMedia('(prefers-color-scheme: dark)').matches;
};

const defaultTheme = (): boolean => {
  const themePreference = getItem(
    THEME_PREFERENCE_LOCAL_STORAGE_KEY
  ) as ThemePreference;

  if (!themePreference || themePreference === 'system')
    return isSystemThemeDark();

  return themePreference === 'dark';
};

export const useThemeFromStore = (): [
  boolean,
  ThemePreference,
  (newValue: ThemePreference) => void
] => {
  const { theme, setTheme } = themeStore((st) => st);
  const preference = useMemo(
    () =>
      (getItem(THEME_PREFERENCE_LOCAL_STORAGE_KEY) as ThemePreference) ||
      'system',
    []
  );

  useEffect(() => {
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const resetTheme = () => setTheme(defaultTheme());

    if (!matchMedia || !('addEventListener' in matchMedia)) return;

    matchMedia.addEventListener('change', resetTheme);
    return () => matchMedia.removeEventListener('change', resetTheme);
  }, [setTheme]);

  return [
    theme,
    preference,
    useCallback(
      (newPreference) => {
        if (newPreference === 'system') {
          setTheme(isSystemThemeDark());
        } else {
          setTheme(newPreference === 'dark');
        }
        setItem(THEME_PREFERENCE_LOCAL_STORAGE_KEY, newPreference);
      },
      [setTheme]
    ),
  ];
};
