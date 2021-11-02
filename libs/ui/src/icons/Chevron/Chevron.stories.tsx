import { Meta, Story } from '@storybook/react';
import { Chevron } from './Chevron';

export default {
  title: 'Icons / Chevron',
  component: Chevron,
} as Meta;

export const Expand: Story = () => <Chevron type="expand" />;
export const Collapse: Story = () => <Chevron type="collapse" />;
