import { useThemeFromStore } from '@decipad/react-contexts';
import { ReactElement } from 'react';

type CommandIconProps = {
  readonly light: ReactElement;
  readonly dark: ReactElement;
};

export const CommandIcon = ({ light, dark }: CommandIconProps) => {
  const [isDarkMode] = useThemeFromStore();

  return isDarkMode ? dark : light;
};
