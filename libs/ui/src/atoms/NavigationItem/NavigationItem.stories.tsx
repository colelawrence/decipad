import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { circleIcon } from '../../storybook-utils';
import { NavigationItem } from './NavigationItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / UI / Navigation Item',
  component: NavigationItem,
  args: {
    children: 'Text',
  },
} as Meta<Args>;

export const TextOnly: StoryFn<Args> = (args) => (
  <NavigationItem onClick={noop} {...args} />
);
export const Icon: StoryFn<Args> = (args) => (
  <NavigationItem onClick={noop} icon={circleIcon} {...args} />
);
