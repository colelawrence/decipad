import { ALLOW_DARK_THEME_LOCAL_STORAGE_KEY } from '@decipad/utils';
import { noop } from 'lodash';
import { useCallback } from 'react';
import { create } from 'zustand';

const getItem =
  'localStorage' in global
    ? global.localStorage.getItem.bind(global.localStorage)
    : (_key: string) => false;
const setItem =
  'localStorage' in global
    ? global.localStorage.setItem.bind(global.localStorage)
    : noop;

const defaultTheme = (): boolean => {
  const isInDarkTheme = getItem(ALLOW_DARK_THEME_LOCAL_STORAGE_KEY);
  return isInDarkTheme
    ? isInDarkTheme === 'true'
    : 'matchMedia' in global
    ? matchMedia('(prefers-color-scheme: dark)').matches
    : false;
};

interface ThemeStore {
  theme: boolean;
  setTheme: (isDarkTheme: boolean) => void;
}

export const themeStore = create<ThemeStore>((set) => ({
  theme: defaultTheme(),
  setTheme: (isDarkTheme: boolean) => set({ theme: isDarkTheme }),
}));

export const useThemeFromStore = (): [boolean, (newValue: boolean) => void] => {
  const store = themeStore((st) => st);
  return [
    store.theme,
    useCallback(
      (isDarkTheme) => {
        store.setTheme(isDarkTheme);
        setItem(ALLOW_DARK_THEME_LOCAL_STORAGE_KEY, String(isDarkTheme));
      },
      [store]
    ),
  ];
};
