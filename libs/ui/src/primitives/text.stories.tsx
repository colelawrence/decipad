import { css } from '@emotion/react';
import { Meta } from '@storybook/react';
import * as storyExports from './text.stories';
import * as textExports from './text';

import {
  display,
  h1,
  p12Bold,
  p12Regular,
  p13SemiBold,
  p15Medium,
  p16Regular,
} from './text';

export default {
  title: 'Primitives / Text',
  argTypes: {
    children: {
      control: 'text',
      defaultValue: 'Text',
    },
  },
} as Meta;

export const Display: React.FC = ({ children }) => (
  <h1 css={css(display)}>{children}</h1>
);
export const H1: React.FC = ({ children }) => <h1 css={css(h1)}>{children}</h1>;

export const P12Regular: React.FC = ({ children }) => (
  <p css={css(p12Regular)}>{children}</p>
);
export const P12Bold: React.FC = ({ children }) => (
  <p css={css(p12Bold)}>{children}</p>
);
export const P13SemiBold: React.FC = ({ children }) => (
  <p css={css(p13SemiBold)}>{children}</p>
);
export const P15Medium: React.FC = ({ children }) => (
  <p css={css(p15Medium)}>{children}</p>
);
export const P16Regular: React.FC = ({ children }) => (
  <p css={css(p16Regular)}>{children}</p>
);

// make sure all types of text are covered by stories
const { default: _storyDefault, ...stories } = storyExports;
const { globalTextStyles: _globalTextStyles, ...textStyles } = textExports;
if (Object.keys(stories).length !== Object.keys(textStyles).length)
  console.error(
    'Not all text styles covered by stories! Text styles:',
    Object.keys(textStyles)
  );
