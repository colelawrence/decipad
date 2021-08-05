import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';

import { buildType } from '@decipad/language';
import { theme, ResultsContextProvider, GlobalStyles } from '../..';
import { ResultsContextValue } from '../Contexts';

const results: ResultsContextValue = {
  cursor: null,
  blockResults: {
    test: {
      blockId: 'test',
      isSyntaxError: false,
      results: [
        {
          blockId: 'test',
          statementIndex: 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueType: buildType.number({ unit: 'apples' } as any),
          value: 20,
        },
      ],
    },
  },
};

const AllTheProviders: React.FC = ({ children }) => {
  return (
    <GlobalStyles>
      <ChakraProvider theme={theme}>
        <ResultsContextProvider value={results}>
          {children}
        </ResultsContextProvider>
      </ChakraProvider>
    </GlobalStyles>
  );
};

const customRender = (
  ui: JSX.Element,
  options?: Omit<RenderOptions, 'queries' | 'wrapper'>
): RenderResult => render(ui, { ...options, wrapper: AllTheProviders });

// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render };
