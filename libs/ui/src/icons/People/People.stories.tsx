import { Meta, Story } from '@storybook/react';
import { People } from './People';

export default {
  title: 'Icons / People',
  component: People,
} as Meta;

export const Normal: Story = () => <People />;
