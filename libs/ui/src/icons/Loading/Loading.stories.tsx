import { Meta, Story } from '@storybook/react';
import { Loading } from './Loading';

export default {
  title: 'Icons / Loading',
  component: Loading,
} as Meta;

export const Normal: Story = () => <Loading />;
