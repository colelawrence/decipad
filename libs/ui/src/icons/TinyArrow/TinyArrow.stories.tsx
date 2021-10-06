import { Meta, Story } from '@storybook/react';
import { TinyArrow } from './TinyArrow';

export default {
  title: 'Icons / TinyArrow',
  component: TinyArrow,
} as Meta;

export const Right: Story = () => <TinyArrow direction="right" />;
export const Down: Story = () => <TinyArrow direction="down" />;
