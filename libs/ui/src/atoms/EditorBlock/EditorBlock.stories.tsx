import { ArgTypes, Meta, Story } from '@storybook/react';
import { blockAlignment } from '../../styles';
import { EditorBlock } from './EditorBlock';

interface Args {
  blockKind: keyof typeof blockAlignment;
}
const argTypes: ArgTypes<Args> = {
  blockKind: {
    control: 'radio',
    options: Object.keys(blockAlignment),
    defaultValue: 'paragraph' as Args['blockKind'],
  },
};

export default {
  title: 'Atoms / Editor / Block',
  component: EditorBlock,
  argTypes,
} as Meta;

export const Normal: Story<Args> = (props) => (
  <EditorBlock {...props}>content</EditorBlock>
);
