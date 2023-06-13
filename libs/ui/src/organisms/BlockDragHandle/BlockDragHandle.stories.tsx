import { Meta, StoryFn } from '@storybook/react';
import { BlockDragHandle } from './BlockDragHandle';

const argTypes = {
  onChangeMenuOpen: { action: 'Menu open state would change to' },
  onDelete: { action: 'Delete' },
};

export default {
  title: 'Organisms / Editor / Drag /  Handle',
  component: BlockDragHandle,
  argTypes,
} as Meta;

export const MenuClosed: StoryFn = (props) => (
  <BlockDragHandle {...props} menuOpen={false} />
);
export const MenuOpen: StoryFn = (props) => (
  <BlockDragHandle {...props} menuOpen />
);
