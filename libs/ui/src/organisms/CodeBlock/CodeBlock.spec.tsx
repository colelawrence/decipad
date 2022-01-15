import { FC } from 'react';
import { render } from '@testing-library/react';
import { IdentifiedResult, InBlockResult } from '@decipad/language';
import { runCode } from '../../test-utils';
import {
  ResultsContextProvider,
  makeResultsContextValue,
} from '../../lib/Contexts/Results';
import { CodeBlock } from './CodeBlock';

const getResultFor = async (code: string): Promise<[IdentifiedResult, FC]> => {
  const result = await runCode(code);

  const block = {
    blockId: 'block-1',
    results: [{ statementIndex: 0, ...result }] as InBlockResult[],
  };

  return [
    block as IdentifiedResult,
    ({ children }) => (
      <ResultsContextProvider
        value={{
          ...makeResultsContextValue(),
          blockResults: {
            [block.blockId]: {
              results: [{ statementIndex: 0, ...result }] as InBlockResult[],
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

it('renders block result', async () => {
  const [block, wrapper] = await getResultFor('9 + 1');
  const { getByText } = render(
    <CodeBlock blockId={block.blockId} expandedResult={block.results[0]}>
      <span>Code</span>
    </CodeBlock>,
    { wrapper }
  );

  expect(getByText('10')).toBeVisible();
});
