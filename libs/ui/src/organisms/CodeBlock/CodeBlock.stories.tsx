import { Meta, Story } from '@storybook/react';
import { SerializedType } from '@decipad/language';
import { docs } from '@decipad/routing';
import { CodeLine } from '..';
import { CodeBlock } from './CodeBlock';

const lines = [
  {
    displayInline: true,
    syntaxError: {
      message: 'SyntaxError',
      url: docs({}).$,
    },
  },
  {
    displayInline: true,
    displayExpanded: true,
    open: true,
    result: {
      value: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
      type: {
        kind: 'column',
        cellType: { kind: 'string' },
        columnSize: 5,
        indexedBy: null,
      } as SerializedType,
    },
  },
];

export default {
  title: 'Organisms / Editor / Code / Block',
  component: CodeBlock,
} as Meta;

export const Normal: Story = () => (
  <CodeBlock>
    <CodeLine {...lines[0]}>42 + 1337;</CodeLine>
    <CodeLine {...lines[1]}>
      ["Lorem", "Ipsum", "Dolor", "Sit", "Amet"]
    </CodeLine>
  </CodeBlock>
);
