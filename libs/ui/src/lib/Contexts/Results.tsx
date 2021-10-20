import { createContext, useContext } from 'react';
import { IdentifiedResult, OptionalValueLocation } from '@decipad/language';

export interface ResultsContextValue {
  cursor: OptionalValueLocation | null;
  blockResults: { [blockId: string]: IdentifiedResult };
}
export const makeResultsContextValue = (): ResultsContextValue => ({
  cursor: null,
  blockResults: {},
});

const ResultsContext = createContext<ResultsContextValue>(
  makeResultsContextValue()
);

export const ResultsContextProvider = ResultsContext.Provider;

export const useResults = () => useContext(ResultsContext);
