import { createContext, useContext } from 'react';
import { IdentifiedResult, OptionalValueLocation } from '@decipad/language';

interface ResultsContextValue {
  readonly cursor: Readonly<OptionalValueLocation> | null;
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
}

export const ResultsContext = createContext<ResultsContextValue>({
  cursor: null,
  blockResults: {},
  indexLabels: new Map(),
});

export const useResults = (): ResultsContextValue => useContext(ResultsContext);
