import { Meta, Story } from '@storybook/react';
import { SerializedType } from '@decipad/language';
import { docs } from '@decipad/routing';
import { withResults } from '../../storybook-utils/results';
import { CodeLine } from '..';
import { CodeBlock } from './CodeBlock';

const block = {
  blockId: 'block-one',
  isSyntaxError: false,
  results: [
    {
      blockId: 'block-one',
      statementIndex: 0,
      value: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
      type: {
        kind: 'column',
        cellType: { kind: 'string' },
        columnSize: 5,
        indexedBy: null,
      } as SerializedType,
      visibleVariables: new Set() as ReadonlySet<string>,
    },
  ],
};

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
    result: {
      type: block.results[0].type,
      value: block.results[0].value,
    },
  },
];

export default {
  title: 'Organisms / Editor / Code / Block',
  component: CodeBlock,
  decorators: [
    withResults({
      [block.blockId]: block,
    }),
  ],
} as Meta;

export const Normal: Story = () => (
  <CodeBlock blockId={block.blockId} expandedResult={block.results[0]}>
    <CodeLine {...lines[0]}>42 + 1337;</CodeLine>
    <CodeLine {...lines[1]}>
      ["Lorem", "Ipsum", "Dolor", "Sit", "Amet"]
    </CodeLine>
  </CodeBlock>
);
