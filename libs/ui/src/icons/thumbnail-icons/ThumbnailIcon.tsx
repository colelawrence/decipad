import { useThemeFromStore } from '@decipad/react-contexts';
import { ReactElement } from 'react';

type ThumbnailIconProps = {
  readonly light: ReactElement;
  readonly dark: ReactElement;
};

export const ThumbnailIcon = ({ light, dark }: ThumbnailIconProps) => {
  const [isDarkMode] = useThemeFromStore();

  return isDarkMode ? dark : light;
};
