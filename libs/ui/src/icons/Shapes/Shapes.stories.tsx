import { Meta, Story } from '@storybook/react';
import { Shapes } from './Shapes';

export default {
  title: 'Icons / Shapes',
  component: Shapes,
} as Meta;

export const Normal: Story = () => <Shapes />;
