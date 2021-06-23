import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';
import React from 'react';

import { Type } from '@decipad/language';
import { theme, ResultsContextProvider } from '../..';

const results = {
  test: {
    type: Type.build({
      type: 'number',
      unit: {
        unit: 'apples',
      },
    } as any),
    value: [20],
    errors: [],
  },
  noResult: null,
};

const AllTheProviders: React.FC = ({ children }) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <ResultsContextProvider value={results}>
        {children}
      </ResultsContextProvider>
    </ChakraProvider>
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
