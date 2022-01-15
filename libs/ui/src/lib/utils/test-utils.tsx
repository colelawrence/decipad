import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import Fraction from '@decipad/fraction';
import { theme, ResultsContextProvider, GlobalStyles } from '../..';
import { ResultsContextValue } from '../Contexts';

const results: ResultsContextValue = {
  cursor: null,
  indexLabels: new Map(),
  blockResults: {
    test: {
      blockId: 'test',
      isSyntaxError: false,
      results: [
        {
          blockId: 'test',
          statementIndex: 0,
          type: { kind: 'number', unit: null },
          value: new Fraction(20n),
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
