import { render } from 'test-utils';
import { Type } from '@decipad/language';
import { Result } from './Result.component';
import { IdentifiedResult } from 'libs/language/src/computer/types';
import { ResultsContextProvider, ResultsContextValue } from '../../../Contexts';

const renderResult = (result: IdentifiedResult) => {
  const allResults: IdentifiedResult[] = [
    {
      blockId: 'wrongId',
      isSyntaxError: true,
      results: [],
    },
    result,
  ];

  const contextValue: ResultsContextValue = {
    cursor: null,
    blockResults: Object.fromEntries(allResults.map((b) => [b.blockId, b])),
  };

  return render(
    <ResultsContextProvider value={contextValue}>
      <Result blockId="blockUnderTest" />
    </ResultsContextProvider>
  );
};

describe('Result Block', () => {
  it('renders', () => {
    const { container } = renderResult({
      blockId: 'blockUnderTest',
      isSyntaxError: false,
      results: [
        {
          blockId: 'blockUnderTest',
          statementIndex: 0,
          valueType: Type.Number,
          value: 3,
        },
      ],
    });

    expect(container).toBeDefined();
  });

  it('matches snapshot for a number', () => {
    const { container } = renderResult({
      blockId: 'blockUnderTest',
      isSyntaxError: false,
      results: [
        {
          blockId: 'blockUnderTest',
          statementIndex: 0,
          valueType: Type.Number,
          value: 3,
        },
      ],
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a column', () => {
    const { container } = renderResult({
      blockId: 'blockUnderTest',
      isSyntaxError: false,
      results: [
        {
          blockId: 'blockUnderTest',
          statementIndex: 0,
          valueType: Type.buildColumn(Type.Number, 3),
          value: [1, 2, 3],
        },
      ],
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a column of columns', () => {
    const { container } = renderResult({
      blockId: 'blockUnderTest',
      isSyntaxError: false,
      results: [
        {
          blockId: 'blockUnderTest',
          statementIndex: 0,
          valueType: Type.buildColumn(Type.buildColumn(Type.String, 2), 3),
          value: [
            ['1', '2'],
            ['3', '4'],
            ['5', '6'],
          ],
        },
      ],
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a syntax error', () => {
    const { container } = renderResult({
      blockId: 'blockUnderTest',
      isSyntaxError: true,
      results: [],
    });

    expect(container).toMatchSnapshot();
  });
});
