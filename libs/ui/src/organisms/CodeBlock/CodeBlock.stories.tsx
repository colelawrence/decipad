import { Meta, Story } from '@storybook/react';
import { AST, Type } from '@decipad/language';

import { withResults } from '../../storybook-utils/results';
import { CodeLine } from '../../atoms';
import { CodeBlock } from './CodeBlock';

function getStatement(): AST.Statement {
  return {
    type: 'column',
  } as AST.Statement;
}

const block = {
  blockId: 'block-one',
  isSyntaxError: false,
  results: [
    {
      blockId: 'block-one',
      statementIndex: 1,
      value: 42 + 1337,
      valueType: {
        type: 'number',
      } as Type,
    },
    {
      blockId: 'block-one',
      statementIndex: 0,
      value: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
      valueType: {
        cellType: {
          type: 'string',
        } as Type,
        columnSize: 5,
      } as Type,
    },
  ],
};

export default {
  title: 'Organisms / Editor / Code Block',
  component: CodeBlock,
  decorators: [
    withResults({
      [block.blockId]: block,
    }),
  ],
} as Meta;

export const Normal: Story = (props) => (
  <CodeBlock {...props} block={block} getStatement={getStatement}>
    <CodeLine>42 + 1337</CodeLine>
    <CodeLine>["Lorem", "Ipsum", "Dolor", "Sit", "Amet"]</CodeLine>
  </CodeBlock>
);
