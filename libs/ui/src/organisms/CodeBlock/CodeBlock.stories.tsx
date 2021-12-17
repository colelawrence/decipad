import { Meta, Story } from '@storybook/react';
import { serializeResult, Type } from '@decipad/language';
import { Statement } from '../../lib/results';
import { withResults } from '../../storybook-utils/results';
import { CodeLine } from '../../atoms';
import { CodeBlock } from './CodeBlock';

const block = {
  blockId: 'block-one',
  isSyntaxError: false,
  results: [
    {
      blockId: 'block-one',
      statementIndex: 1,
      value: null,
      valueType: {
        errorCause: {
          message: 'This operation requires matching units',
          url: 'https://dev.decipad.com/docs/docs/language/composing-units',
        },
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

const statements: Statement[] = [
  {
    displayInline: true,
    startLine: 1,
    endLine: 1,
    result: serializeResult(block.results[0].valueType, block.results[0].value),
  },
  {
    displayInline: true,
    startLine: 2,
    endLine: 2,
    result: serializeResult(block.results[1].valueType, block.results[1].value),
  },
];

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
  <CodeBlock {...props} blockId={block.blockId} statements={statements}>
    <CodeLine>42 + 1337</CodeLine>
    <CodeLine>["Lorem", "Ipsum", "Dolor", "Sit", "Amet"]</CodeLine>
  </CodeBlock>
);
