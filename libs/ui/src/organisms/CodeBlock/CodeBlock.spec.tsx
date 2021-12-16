import { FC } from 'react';
import { render } from '@testing-library/react';
import {
  parseOneBlock,
  runCode,
  IdentifiedResult,
  InBlockResult,
  AST,
} from '@decipad/language';
import {
  ResultsContextProvider,
  makeResultsContextValue,
} from '../../lib/Contexts/Results';
import { CodeBlock } from './CodeBlock';

const getResultFor = async (
  code: string
): Promise<[IdentifiedResult, () => AST.Statement, FC]> => {
  const { value, type: valueType } = await runCode(code);

  const block = {
    blockId: 'block-1',
    results: [{ statementIndex: 0, value, valueType }] as InBlockResult[],
  };

  const getStatement = () => parseOneBlock(code).args[0];

  return [
    block as IdentifiedResult,
    getStatement,
    ({ children }) => (
      <ResultsContextProvider
        value={{
          ...makeResultsContextValue(),
          blockResults: {
            [block.blockId]: {
              results: [
                { statementIndex: 0, value, valueType },
              ] as InBlockResult[],
            } as IdentifiedResult,
          },
        }}
      >
        {children}
      </ResultsContextProvider>
    ),
  ];
};

it('renders children', async () => {
  const { getByText } = render(
    <CodeBlock>
      <span>Code</span>
    </CodeBlock>
  );

  expect(getByText('Code')).toBeVisible();
});

it('renders both inline and block result', async () => {
  const [block, getStatement, wrapper] = await getResultFor('9 + 1');
  const { getAllByText } = render(
    <CodeBlock block={block} getStatement={getStatement}>
      <span>Code</span>
    </CodeBlock>,
    { wrapper }
  );

  expect(getAllByText('10')).toHaveLength(2);
});

describe('inline results', () => {
  it('renders multi-line statements result in multiple lines', async () => {
    const [block, getStatement] = await getResultFor('(9 \n+ \n1)');
    const { getByText } = render(
      <CodeBlock block={block} getStatement={getStatement}>
        <span>Code</span>
      </CodeBlock>
    );

    // Because we're not rendering the wrapper with the ResultContext, the block result won't render,
    // only the inline result.
    expect(
      getComputedStyle(getByText('10').closest('[contenteditable="false"]')!)
    ).toHaveProperty('grid-row', '1/3');
  });
});
