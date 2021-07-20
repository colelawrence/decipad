import { Meta } from '@storybook/react';
import { NavigationItem } from '../../atoms';
import { noop } from '../../utils';
import { NavigationList } from './NavigationList';

export default {
  title: 'Molecules / Navigation List',
  component: NavigationList,
} as Meta;

export const Normal = () => (
  <NavigationList>
    <NavigationItem onClick={noop}>Item 1</NavigationItem>
    <NavigationItem onClick={noop}>Item 2</NavigationItem>
  </NavigationList>
);
