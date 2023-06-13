import { Meta, StoryFn } from '@storybook/react';
import { AutoCompleteMenu, AutoCompleteMenuProps } from './AutoCompleteMenu';

const args: AutoCompleteMenuProps = {
  search: '',
  identifiers: [
    { kind: 'variable', type: 'number', identifier: 'ThisIsAVar' },
    { kind: 'variable', type: 'number', identifier: 'ThisIsAnotherVar' },
    { kind: 'variable', type: 'number', identifier: 'Another' },
    { kind: 'variable', type: 'number', identifier: 'OneMore' },
    { kind: 'variable', type: 'number', identifier: 'Enough' },
    { kind: 'variable', type: 'number', identifier: 'NoMore' },
    { kind: 'variable', type: 'number', identifier: 'Hidden' },
  ],
};

export default {
  title: 'Organisms / Editor / Auto Complete Menu',
  component: AutoCompleteMenu,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <AutoCompleteMenu {...props} />
);
