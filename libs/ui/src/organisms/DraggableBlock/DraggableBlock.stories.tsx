import { ArgTypes, Meta, StoryFn } from '@storybook/react';
import { blockAlignment } from '../../styles';
import { DraggableBlock } from './DraggableBlock';

const argTypes: ArgTypes = {
  blockKind: {
    options: Object.keys(blockAlignment),
    control: { type: 'select' },
    defaultValue: 'paragraph',
  },
};
type Args = { blockKind: keyof typeof blockAlignment };

export default {
  title: 'Organisms / Editor / Drag / Block',
  component: DraggableBlock,
  argTypes,
} as Meta;

export const Normal: StoryFn<Args> = (props) => (
  <DraggableBlock {...props}>block</DraggableBlock>
);
export const BeingDragged: StoryFn<Args> = (props) => (
  <DraggableBlock {...props} isBeingDragged>
    block
  </DraggableBlock>
);
export const DragHoveringAbove: StoryFn<Args> = (props) => (
  <DraggableBlock {...props} dropLine="top">
    block
  </DraggableBlock>
);
export const DragHoveringBelow: StoryFn<Args> = (props) => (
  <DraggableBlock {...props} dropLine="bottom">
    block
  </DraggableBlock>
);
