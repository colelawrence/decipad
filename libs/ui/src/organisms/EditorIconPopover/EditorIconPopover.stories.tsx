import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { EditorIconPopover } from './EditorIconPopover';

const args: ComponentProps<typeof EditorIconPopover> = {
  initialColor: 'Sun',
  initialIcon: 'Spider',
};

export default {
  title: 'Organisms / Editor Icon Popover',
  component: EditorIconPopover,
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <EditorIconPopover {...props} />
);
