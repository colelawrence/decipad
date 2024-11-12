/* eslint decipad/css-prop-named-variable: 0 */
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { Decorator, StoryFn } from '@storybook/react';

export const inMenu: Decorator = (story: StoryFn, context: any) => (
  <RadixDropdown.Root open modal={false}>
    <RadixDropdown.Trigger asChild>
      <div css={{ display: 'none' }} />
    </RadixDropdown.Trigger>
    <div
      css={{ '>[data-radix-popper-content-wrapper]': { display: 'contents' } }}
    >
      <RadixDropdown.Content>{story({}, context)}</RadixDropdown.Content>
    </div>
  </RadixDropdown.Root>
);
