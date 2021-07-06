import { createContext, useContext } from 'react';
import { IdentifiedResult } from '@decipad/language';

export type CursorPos = [string, number];
export interface ResultsContextValue {
  cursor: CursorPos | null;
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
