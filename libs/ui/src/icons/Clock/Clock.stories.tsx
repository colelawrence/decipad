import { Meta, Story } from '@storybook/react';
import { Clock } from './Clock';

export default {
  title: 'Icons / Clock',
  component: Clock,
} as Meta;

export const Normal: Story = () => <Clock />;
