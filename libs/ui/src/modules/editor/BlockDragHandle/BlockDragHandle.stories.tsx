import { Meta } from '@storybook/react';
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

export const MenuClosed = (props: BlockDragHandleProps) => (
  <BlockDragHandle {...props} />
);
export const MenuOpen = (props: BlockDragHandleProps) => (
  <BlockDragHandle {...props} />
);
