import { Meta, Story } from '@storybook/react';
import { circleIcon, sidePadding } from '../../storybook-utils';
import { noop } from '../../utils';

import { NavigationItem } from './NavigationItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Navigation Item',
  component: NavigationItem,
  decorators: [sidePadding(8)],
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
