import { Meta, Story } from '@storybook/react';
import { cssVar } from '../../primitives';
import { sidePadding } from '../../storybook-utils';
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
  <NavigationItem
    onClick={noop}
    icon={
      <svg viewBox="0 0 1 1">
        <circle cx="50%" cy="50%" r="50%" fill={cssVar('currentTextColor')} />
      </svg>
    }
    {...args}
  />
);
