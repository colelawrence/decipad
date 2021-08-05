import { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';
import { ChakraProvider } from '@chakra-ui/react';
import { Parameters, DecoratorFn } from '@storybook/react';

import { theme, GlobalStyles } from '../src';
import {
  smallestMobile,
  smallestDesktop,
  largestDesktop,
} from '../src/primitives';
import { ALLOW_DARK_THEME_LOCAL_STORAGE_KEY } from '../src/utils';

const withGlobalStyles: DecoratorFn = (StoryFn, context) => {
  return (
    <GlobalStyles>
      <ChakraProvider theme={theme}>
        <StoryFn {...context} />
      </ChakraProvider>
    </GlobalStyles>
  );
};

const SetAllowDarkMode: React.FC = ({ children }) => {
  const allowDarkMode = useDarkMode();
  useEffect(() => {
    localStorage.setItem(
      ALLOW_DARK_THEME_LOCAL_STORAGE_KEY,
      String(allowDarkMode)
    );
  }, [allowDarkMode]);
  return <>{children}</>;
};
const withDarkMode: DecoratorFn = (StoryFn, context) => {
  return (
    <SetAllowDarkMode>
      <StoryFn {...context} />
    </SetAllowDarkMode>
  );
};

export const decorators: DecoratorFn[] = [withGlobalStyles, withDarkMode];

export const parameters: Parameters = {
  viewport: {
    viewports: Object.fromEntries(
      Object.entries({
        'Smallest Mobile': smallestMobile,
        'Smallest Desktop': smallestDesktop,
        'Largest Desktop': largestDesktop,
      }).map(([name, device]) => [
        name,
        {
          name,
          styles: {
            width: `${device.portrait.width}px`,
            height: `${device.portrait.height}px`,
          },
        },
      ])
    ),
    defaultViewport: 'Smallest Mobile',
  },
};
