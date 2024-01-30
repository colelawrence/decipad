import { Meta, StoryFn } from '@storybook/react';
import { Counter } from './Counter';

export default {
  title: 'Atoms / UI / Counter Bubble',
  component: Counter,
} as Meta;

export const Normal: StoryFn = () => (
  <>
    <span>Count is</span> <Counter n={5} />
  </>
);
