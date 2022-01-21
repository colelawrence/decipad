import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { DecoratorFn } from '@storybook/react';

export const inMenu: DecoratorFn = (story) => (
  <RadixDropdown.Root open modal={false}>
    <RadixDropdown.Trigger asChild>
      <div css={{ display: 'none' }} />
    </RadixDropdown.Trigger>
    <div
      css={{ '>[data-radix-popper-content-wrapper]': { display: 'contents' } }}
    >
      <RadixDropdown.Content portalled={false}>{story()}</RadixDropdown.Content>
    </div>
  </RadixDropdown.Root>
);
