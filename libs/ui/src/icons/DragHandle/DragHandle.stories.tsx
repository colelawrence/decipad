import { Meta, Story } from '@storybook/react';
import { DragHandle } from './DragHandle';

export default {
  title: 'Icons / Drag Handle',
  component: DragHandle,
} as Meta;

export const Normal: Story = () => <DragHandle />;
