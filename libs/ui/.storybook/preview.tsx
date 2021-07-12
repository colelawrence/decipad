import { ChakraProvider } from '@chakra-ui/react';
import { Parameters, DecoratorFn } from '@storybook/react';

import { theme, GlobalStyles } from '../src';
import {
  smallestMobile,
  smallestDesktop,
  largestDesktop,
} from '../src/primitives';

const withGlobalStyles: DecoratorFn = (StoryFn, context) => {
  return (
    <GlobalStyles>
      <ChakraProvider theme={theme}>
        <StoryFn {...context} />
      </ChakraProvider>
    </GlobalStyles>
  );
};
export const decorators: DecoratorFn[] = [withGlobalStyles];

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
