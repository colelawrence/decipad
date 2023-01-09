import { Meta, Story } from '@storybook/react';
import { DropdownAddOptionProps, DropdownOption } from './DropdownOption';

const args: DropdownAddOptionProps = {
  value: 'Hello',
  setValue: () => {},
};

export default {
  title: 'Molecules / Editor / Dropdown Option',
  component: DropdownOption,
} as Meta;

export const Normal: Story = () => <DropdownOption {...args} />;
