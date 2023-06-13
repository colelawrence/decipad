import { Meta, StoryFn } from '@storybook/react';
import { Placeholder } from './Placeholder';

export default {
  title: 'Atoms / Editor / Placeholder',
  component: Placeholder,
} as Meta;

export const Normal: StoryFn = () => <Placeholder />;
export const LessRound: StoryFn = () => <Placeholder lessRound />;
