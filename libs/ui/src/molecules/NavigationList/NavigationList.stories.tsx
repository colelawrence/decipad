import { Meta, Story } from '@storybook/react';
import { noop } from '@decipad/utils';
import { NavigationItem } from '../../atoms';
import { sidePadding } from '../../storybook-utils';
import { NavigationList } from './NavigationList';

export default {
  title: 'Molecules / Navigation List',
  decorators: [sidePadding(8)],
  component: NavigationList,
} as Meta;

export const Normal: Story = () => (
  <NavigationList>
    <NavigationItem onClick={noop}>Item 1</NavigationItem>
    <NavigationItem onClick={noop}>Item 2</NavigationItem>
  </NavigationList>
);
