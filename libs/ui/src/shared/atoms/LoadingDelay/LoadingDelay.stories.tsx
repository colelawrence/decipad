import { Meta, StoryFn } from '@storybook/react';
import { LoadingDelay } from './LoadingDelay';

const meta: Meta<typeof LoadingDelay> = {
  title: 'Atoms / UI / Loading / Delay',
  component: LoadingDelay,
};

export default meta;

export const Normal: StoryFn = () => (
  <LoadingDelay>
    <p>hello</p>
  </LoadingDelay>
);
