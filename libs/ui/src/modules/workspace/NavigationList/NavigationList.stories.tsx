import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';

import { NavigationList } from './NavigationList';
import { NavigationItem } from '../NavigationItem/NavigationItem';

export default {
  title: 'Molecules / UI / Navigation List',
  component: NavigationList,
} as Meta;

export const Normal: StoryFn = () => (
  <NavigationList>
    <NavigationItem onClick={noop}>Item 1</NavigationItem>
    <NavigationItem onClick={noop}>Item 2</NavigationItem>
  </NavigationList>
);
