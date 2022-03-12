import { IdentifiedResult } from '@decipad/language';
import { createContext, useContext } from 'react';

export interface ResultsContextValue {
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
}

export const ResultsContext = createContext<ResultsContextValue>({
  blockResults: {},
  indexLabels: new Map(),
});

export const useResults = (): ResultsContextValue => useContext(ResultsContext);
