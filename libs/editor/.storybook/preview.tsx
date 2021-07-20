import { addDecorator } from '@storybook/react';
import React from 'react';
import { GlobalStyles } from '../../ui/src/templates/GlobalStyles/GlobalStyles';

const withEmotion = (StoryFn: () => JSX.Element, context: any) => {
  return (
    <GlobalStyles>
      <StoryFn {...context} />
    </GlobalStyles>
  );
};

addDecorator(withEmotion);
