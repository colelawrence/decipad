import { addDecorator, DecoratorFn } from '@storybook/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { GlobalStyles } from '@decipad/ui';

const withEmotion: DecoratorFn = (StoryFn, context) => {
  return (
    <GlobalStyles>
      <StoryFn {...context} />
    </GlobalStyles>
  );
};

addDecorator(withEmotion);
