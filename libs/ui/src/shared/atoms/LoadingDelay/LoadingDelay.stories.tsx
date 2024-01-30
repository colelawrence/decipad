import { Meta, Story } from '@storybook/react';
import { LoadingDelay } from './LoadingDelay';

export default {
  title: 'Atoms / UI / Loading / Delay',
  component: LoadingDelay,
} as Meta;

export const Normal: Story = () => (
  <LoadingDelay>
    <p>hello</p>
  </LoadingDelay>
);
