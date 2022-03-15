import { Meta, Story } from '@storybook/react';
import { noop } from '@decipad/utils';
import { circleIcon } from '../../storybook-utils';

import { NavigationItem } from './NavigationItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Navigation Item',
  component: NavigationItem,
  args: {
    children: 'Text',
  },
} as Meta<Args>;

export const TextOnly: Story<Args> = (args) => (
  <NavigationItem onClick={noop} {...args} />
);
export const Icon: Story<Args> = (args) => (
  <NavigationItem onClick={noop} icon={circleIcon} {...args} />
);
