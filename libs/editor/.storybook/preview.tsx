import { addDecorator } from '@storybook/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { GlobalStyles } from '../../ui/src/templates/GlobalStyles/GlobalStyles';

const withEmotion = (StoryFn: () => JSX.Element, context: any) => {
  return (
    <GlobalStyles>
      <StoryFn {...context} />
    </GlobalStyles>
  );
};

addDecorator(withEmotion);
