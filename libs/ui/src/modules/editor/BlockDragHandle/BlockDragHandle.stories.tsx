import { Meta } from '@storybook/react';
import { BlockDragHandle, BlockDragHandleProps } from './BlockDragHandle';
import { DragHandle } from 'libs/ui/src/icons';

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
MenuClosed.args = {
  children: <div></div>,
  MainButton: <DragHandle />,
};

export const MenuOpen = (props: BlockDragHandleProps) => (
  <BlockDragHandle {...props} />
);
MenuOpen.args = {
  children: <div></div>,
  MainButton: <DragHandle />,
};
