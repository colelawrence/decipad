import { ChakraProvider } from '@chakra-ui/react';
import { withKnobs } from '@storybook/addon-knobs';
import { addDecorator } from '@storybook/react';
import { theme } from '../src/lib/theme.ts';

const withChakra = (StoryFn) => {
  return (
    <ChakraProvider theme={theme}>
      <StoryFn />
    </ChakraProvider>
  );
};

addDecorator(withKnobs);
addDecorator(withChakra);
