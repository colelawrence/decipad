/* eslint decipad/css-prop-named-variable: 0 */
import { Meta, StoryFn } from '@storybook/react';
import { cssVar } from '../../primitives';
import { Dot } from './Dot';

export default {
  title: 'Atoms / UI / Dot',
  component: Dot,
} as Meta;

export const Normal: StoryFn = () => (
  <Dot>
    <span css={{ padding: '4px 8px', background: cssVar('backgroundHeavy') }}>
      Some text with a background
    </span>
  </Dot>
);
