import { Meta, Story } from '@storybook/react';
import { AvailableSwatchColor } from '../../utils';
import { IconPopover } from './IconPopover';

const args = {
  color: 'Catskill' as AvailableSwatchColor,
  trigger: <div>Hello</div>,
};

export default {
  title: 'Molecules / UI / Icon / Popover',
  component: IconPopover,
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => <IconPopover {...props} />;
