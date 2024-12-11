import { Meta, StoryFn } from '@storybook/react';
import {
  DropdownEditOptionProps,
  DropdownEditOption,
} from './DropdownEditOption';

const args: DropdownEditOptionProps = {
  value: 'Hello',
  setValue: () => {},
};

export default {
  title: 'Molecules / Editor / Dropdown Add Option',
  component: DropdownEditOption,
} as Meta;

export const Normal: StoryFn = () => <DropdownEditOption {...args} />;
