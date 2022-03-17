import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BehaviorSubject,
  distinctUntilChanged,
  EMPTY,
  map,
  Observable,
} from 'rxjs';
import { dequal } from 'dequal';

import { IdentifiedResult, delayErrors } from '@decipad/language';

export interface ResultsContextItem {
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly delayedResultBlockId: string | null;
}

export const defaultResults: ResultsContextItem = {
  blockResults: {},
  indexLabels: new Map(),
  delayedResultBlockId: null,
};

export const ResultsContext =
  createContext<Observable<ResultsContextItem>>(EMPTY);

/** A ResultsContext.Provider with a value for tests */
export const TestResultsProvider: React.FC<Partial<ResultsContextItem>> = ({
  children,
  ...contextItem
}) => {
  const value = new BehaviorSubject({ ...defaultResults, ...contextItem });
  return React.createElement(ResultsContext.Provider, { value }, children);
};

export const useResults = (): ResultsContextItem => {
  const subject = useContext(ResultsContext);
  const [resultsItem, setResultsItem] = useState(defaultResults);

  useEffect(() => {
    const subscription = subject.subscribe(setResultsItem);
    return () => subscription.unsubscribe();
  }, [subject]);

  return resultsItem;
};

/**
 * Obtain a code line's result from the results context.
 * Errors are debounced if the cursor is in this line, for UX reasons.
 * */
export const useResult = (blockId: string): IdentifiedResult | null => {
  const subject = useContext(ResultsContext);
  const [result, setResult] = useState<IdentifiedResult | null>(null);

  useEffect(() => {
    const subscription = subject
      .pipe(
        map(({ blockResults, delayedResultBlockId }) => ({
          result: blockResults[blockId] ?? null,
          needsDelay: delayedResultBlockId === blockId,
        })),
        distinctUntilChanged((a, b) => dequal(a, b)),
        delayErrors({
          shouldDelay$: subject.pipe(
            map(({ delayedResultBlockId }) => delayedResultBlockId === blockId)
          ),
        })
      )
      .subscribe((possiblyDelayed) => {
        setResult(possiblyDelayed.result);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [subject, blockId]);

  return result;
};
