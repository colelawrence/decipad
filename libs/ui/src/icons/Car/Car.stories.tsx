import { Meta, Story } from '@storybook/react';
import { Car } from './Car';

export default {
  title: 'Icons / Car',
  component: Car,
} as Meta;

export const Normal: Story = () => <Car />;
