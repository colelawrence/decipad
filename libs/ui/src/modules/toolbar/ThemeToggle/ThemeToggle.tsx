import { useThemeFromStore } from '@decipad/react-contexts';
import * as Styled from './styles';
import { useCallback } from 'react';

export const ThemeToggle = () => {
  const [isDarkMode, _, setModePreference] = useThemeFromStore();

  const toggleTheme = useCallback(() => {
    if (isDarkMode) {
      setModePreference('light');
    } else {
      setModePreference('dark');
    }
  }, [isDarkMode, setModePreference]);

  return <Styled.Toggle onClick={toggleTheme}>Toggle Theme</Styled.Toggle>;
};
