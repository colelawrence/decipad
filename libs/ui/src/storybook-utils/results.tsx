import { DecoratorFn } from '@storybook/react';
import { IdentifiedResult } from '@decipad/language';

import {
  ResultsContextProvider,
  makeResultsContextValue,
} from '../lib/Contexts/Results';

type ResultDecoratorFactory = (blockResults: {
  [blockId: string]: IdentifiedResult;
}) => DecoratorFn;

export const withResults: ResultDecoratorFactory = (blockResults) => (Story) =>
  (
    <ResultsContextProvider
      value={{
        ...makeResultsContextValue(),
        blockResults,
      }}
    >
      <Story />
    </ResultsContextProvider>
  );
