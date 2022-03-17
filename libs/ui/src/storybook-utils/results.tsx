import { DecoratorFn } from '@storybook/react';
import {
  ResultsContext,
  ResultsContextItem,
  useResults,
} from '@decipad/react-contexts';
import { ComponentProps, FC } from 'react';
import { BehaviorSubject } from 'rxjs';

const ResultsProvider: FC<Pick<ResultsContextItem, 'blockResults'>> = ({
  blockResults,
  children,
}) => (
  <ResultsContext.Provider
    value={new BehaviorSubject({ ...useResults(), blockResults })}
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
