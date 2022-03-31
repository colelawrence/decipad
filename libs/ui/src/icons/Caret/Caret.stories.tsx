import { Meta, Story } from '@storybook/react';
import { Caret } from './Caret';

export default {
  title: 'Icons / Caret',
  component: Caret,
} as Meta;

export const Down: Story = () => <Caret variant="down" />;

export const Right: Story = () => <Caret variant="right" />;

export const Up: Story = () => <Caret variant="up" />;
