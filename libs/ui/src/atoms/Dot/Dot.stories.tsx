import { Meta, Story } from '@storybook/react';
import { cssVar } from '../../primitives';
import { Dot } from './Dot';

export default {
  title: 'Atoms / UI / Dot',
  component: Dot,
} as Meta;

export const Normal: Story = () => (
  <Dot>
    <span
      css={{ padding: '4px 8px', background: cssVar('strongHighlightColor') }}
    >
      Some text with a background
    </span>
  </Dot>
);
