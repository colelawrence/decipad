import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { DecoratorFn } from '@storybook/react';

export const inMenu: DecoratorFn = (story) => (
  <RadixDropdown.Root open>
    <RadixDropdown.Trigger css={{ height: 0 }}>&nbsp;</RadixDropdown.Trigger>
    <RadixDropdown.Content>{story()}</RadixDropdown.Content>
  </RadixDropdown.Root>
);
