import { Meta, Story } from '@storybook/react';
import { Caret } from './Caret';

export default {
  title: 'Icons / Caret',
  component: Caret,
} as Meta;

export const Expand: Story = () => <Caret type="expand" />;
export const Collapse: Story = () => <Caret type="collapse" />;
