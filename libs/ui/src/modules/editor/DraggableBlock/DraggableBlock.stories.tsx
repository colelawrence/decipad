import { ArgTypes, Meta } from '@storybook/react';
import { blockAlignment } from '../../../styles';
import { DraggableBlock, DraggableBlockProps } from './DraggableBlock';

const argTypes: ArgTypes = {
  blockKind: {
    options: Object.keys(blockAlignment),
    control: { type: 'select' },
    defaultValue: 'paragraph',
  },
};

export default {
  title: 'Organisms / Editor / Drag / Block',
  component: DraggableBlock,
  argTypes,
} as Meta;

export const Normal = (props: DraggableBlockProps) => (
  <DraggableBlock {...props}>block</DraggableBlock>
);
export const BeingDragged = (props: DraggableBlockProps) => (
  <DraggableBlock {...props} isBeingDragged>
    block
  </DraggableBlock>
);
export const DragHoveringAbove = (props: DraggableBlockProps) => (
  <DraggableBlock {...props} dropLine="top">
    block
  </DraggableBlock>
);
export const DragHoveringBelow = (props: DraggableBlockProps) => (
  <DraggableBlock {...props} dropLine="bottom">
    block
  </DraggableBlock>
);
