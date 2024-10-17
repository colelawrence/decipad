import { Meta, StoryFn } from '@storybook/react';
import { AutoCompleteMenu, AutoCompleteMenuProps } from './AutoCompleteMenu';

const args: AutoCompleteMenuProps = {
  search: '',
  identifiers: [
    {
      autocompleteGroup: 'variable',
      kind: 'number',
      name: 'ThisIsAVar',
    },
    {
      autocompleteGroup: 'variable',
      kind: 'number',
      name: 'ThisIsAnotherVar',
    },
    {
      autocompleteGroup: 'variable',
      kind: 'number',
      name: 'Another',
    },
    {
      autocompleteGroup: 'variable',
      kind: 'number',
      name: 'OneMore',
    },
    { autocompleteGroup: 'variable', kind: 'number', name: 'Enough' },
    { autocompleteGroup: 'variable', kind: 'number', name: 'NoMore' },
    { autocompleteGroup: 'variable', kind: 'number', name: 'Hidden' },
  ],
};

export default {
  title: 'Organisms / Editor / Auto Complete Menu',
  component: AutoCompleteMenu,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: AutoCompleteMenuProps) => (
  <AutoCompleteMenu {...props} />
);
