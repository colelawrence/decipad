import { Meta, Story } from '@storybook/react';
import { AutoCompleteMenu } from './AutoCompleteMenu';

const args = {
  search: '',
  identifiers: [
    { kind: 'variable' as const, identifier: 'ThisIsAVar' },
    { kind: 'variable' as const, identifier: 'ThisIsAnotherVar' },
    { kind: 'variable' as const, identifier: 'Another' },
    { kind: 'variable' as const, identifier: 'OneMore' },
    { kind: 'variable' as const, identifier: 'Enough' },
    { kind: 'variable' as const, identifier: 'NoMore' },
    { kind: 'variable' as const, identifier: 'Hidden' },
  ],
};

export default {
  title: 'Organisms / Editor / Auto Complete Menu',
  component: AutoCompleteMenu,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <AutoCompleteMenu {...props} />
);
