import { Meta, Story } from '@storybook/react';
import { Placeholder } from './Placeholder';

export default {
  title: 'Atoms / Placeholder',
  component: Placeholder,
} as Meta;

export const Normal: Story = () => <Placeholder />;
export const LessRound: Story = () => <Placeholder lessRound />;
