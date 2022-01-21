import { DecoratorFn } from '@storybook/react';
import { ResultsContext, useResults } from '@decipad/react-contexts';
import { ComponentProps, ContextType, FC } from 'react';

const ResultsProvider: FC<
  Pick<ContextType<typeof ResultsContext>, 'blockResults'>
> = ({ blockResults, children }) => (
  <ResultsContext.Provider
    value={{
      ...useResults(),
      blockResults,
    }}
  >
    {children}
  </ResultsContext.Provider>
);
export const withResults =
  (
    blockResults: ComponentProps<typeof ResultsProvider>['blockResults']
  ): DecoratorFn =>
  (Story, context) =>
    (
      <ResultsProvider blockResults={blockResults}>
        <Story {...context} />
      </ResultsProvider>
    );
