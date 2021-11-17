import { addDecorator, DecoratorFn } from '@storybook/react';
import { GlobalStyles } from '@decipad/ui';

const withEmotion: DecoratorFn = (StoryFn, context) => {
  return (
    <GlobalStyles>
      <StoryFn {...context} />
    </GlobalStyles>
  );
};

addDecorator(withEmotion);
