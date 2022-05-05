import { ArgTypes, Meta, Story } from '@storybook/react';
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

export const Normal: Story<Args> = (props) => (
  <DraggableBlock {...props}>block</DraggableBlock>
);
export const BeingDragged: Story<Args> = (props) => (
  <DraggableBlock {...props} isBeingDragged>
    block
  </DraggableBlock>
);
export const DragHoveringAbove: Story<Args> = (props) => (
  <DraggableBlock {...props} dropLine="top">
    block
  </DraggableBlock>
);
export const DragHoveringBelow: Story<Args> = (props) => (
  <DraggableBlock {...props} dropLine="bottom">
    block
  </DraggableBlock>
);
