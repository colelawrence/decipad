import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';

import { Type } from '@decipad/language';
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
          valueType: Type.build({
            type: 'number',
            unit: {
              unit: 'apples',
            },
          } as any),
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
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render };
