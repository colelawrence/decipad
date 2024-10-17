import { Meta, StoryFn } from '@storybook/react';
import { BlockDragHandle, BlockDragHandleProps } from './BlockDragHandle';

const argTypes = {
  onChangeMenuOpen: { action: 'Menu open state would change to' },
  onDelete: { action: 'Delete' },
};

export default {
  title: 'Organisms / Editor / Drag /  Handle',
  component: BlockDragHandle,
  argTypes,
} as Meta;

export const MenuClosed: StoryFn = (props: BlockDragHandleProps) => (
  <BlockDragHandle {...props} menuOpen={false} />
);
export const MenuOpen: StoryFn = (props: BlockDragHandleProps) => (
  <BlockDragHandle {...props} menuOpen />
);
