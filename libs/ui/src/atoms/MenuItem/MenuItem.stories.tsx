import { Meta, Story } from '@storybook/react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { FC } from 'react';
import { cssVar } from '../../primitives';
import { MenuItem } from './MenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Menu Item',
  component: MenuItem,
  args: {
    children: 'Text',
  },
} as Meta<Args>;

const Wrapper: FC = ({ children }) => (
  <RadixDropdown.Root open>
    <RadixDropdown.Trigger css={{ height: 0 }}>&nbsp;</RadixDropdown.Trigger>
    <RadixDropdown.Content>{children}</RadixDropdown.Content>
  </RadixDropdown.Root>
);

export const TextOnly: Story<Args> = (args) => (
  <Wrapper>
    <MenuItem {...args} />
  </Wrapper>
);
export const Icon: Story<Args> = (args) => (
  <Wrapper>
    <MenuItem
      icon={
        <svg viewBox="0 0 1 1">
          <circle cx="50%" cy="50%" r="50%" fill={cssVar('currentTextColor')} />
        </svg>
      }
      {...args}
    />
  </Wrapper>
);
