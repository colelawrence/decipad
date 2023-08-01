/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { THEME_PREFERENCE_LOCAL_STORAGE_KEY } from './storage';

export type ThemePreference = 'system' | 'light' | 'dark';

const getItem =
  'localStorage' in global
    ? global.localStorage.getItem.bind(global.localStorage)
    : (_key: string) => false;

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

interface ThemeStore {
  theme: boolean;
  setTheme: (isDarkTheme: boolean) => void;
}

export const themeStore = create<ThemeStore>((set) => ({
  theme: defaultTheme(),
  setTheme: (isDarkTheme: boolean) => set({ theme: isDarkTheme }),
}));
