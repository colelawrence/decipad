import { FC } from 'react';
import { render } from '@testing-library/react';
import {
  parseOneBlock,
  runCode,
  IdentifiedResult,
  InBlockResult,
} from '@decipad/language';
import {
  ResultsContextProvider,
  makeResultsContextValue,
} from '../../lib/Contexts/Results';
import { Statement } from '../../lib/results';
import { runCode as serializedRunCode } from '../../test-utils';
import { CodeBlock } from './CodeBlock';

const getResultFor = async (
  code: string
): Promise<[IdentifiedResult, Statement[], FC]> => {
  const { value, type: valueType } = await runCode(code);
  const result = await serializedRunCode(code);

  const block = {
    blockId: 'block-1',
    results: [{ statementIndex: 0, value, valueType }] as InBlockResult[],
  };

  const stmt = parseOneBlock(code).args[0];

  return [
    block as IdentifiedResult,
    [
      {
        displayInline: true,
        startLine: stmt.start?.line ?? 0,
        endLine: stmt.end?.line ?? 0,
        result,
      },
    ],
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
  const [block, statements, wrapper] = await getResultFor('9 + 1');
  const { getAllByText } = render(
    <CodeBlock blockId={block.blockId} statements={statements}>
      <span>Code</span>
    </CodeBlock>,
    { wrapper }
  );

  expect(getAllByText('10')).toHaveLength(2);
});

describe('inline results', () => {
  it('renders multi-line statements result in multiple lines', async () => {
    const [block, statements] = await getResultFor('(9 \n+ \n1)');
    const { getByText } = render(
      <CodeBlock blockId={block.blockId} statements={statements}>
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
