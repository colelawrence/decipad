import { Meta, Story } from '@storybook/react';
import { Callout } from './Callout';

export default {
  title: 'Icons / Callout',
  component: Callout,
} as Meta;

export const Normal: Story = () => <Callout />;
