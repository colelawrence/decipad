import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BehaviorSubject,
  distinctUntilChanged,
  EMPTY,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import { dequal } from 'dequal';

import {
  IdentifiedResult,
  delayErrors,
  defaultComputerResults,
} from '@decipad/language';

export interface ResultsContextItem {
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly delayedResultBlockId: string | null;
}

export const ResultsContext =
  createContext<Observable<ResultsContextItem>>(EMPTY);

/** A ResultsContext.Provider with a value for tests */
export const TestResultsProvider: React.FC<Partial<ResultsContextItem>> = ({
  children,
  ...contextItem
}) => {
  const value = new BehaviorSubject({
    ...defaultComputerResults,
    ...contextItem,
  });
  return React.createElement(ResultsContext.Provider, { value }, children);
};

export const useResults = (): ResultsContextItem => {
  const subject = useContext(ResultsContext);
  const [resultsItem, setResultsItem] = useState(defaultComputerResults);

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
export const useResult = (
  blockId: string,
  element?: Element | null
): IdentifiedResult | null => {
  const subject = useContext(ResultsContext);
  const [result, setResult] = useState<IdentifiedResult | null>(null);

  useEffect(() => {
    const results$ = subject.pipe(
      map(({ blockResults, delayedResultBlockId }) => ({
        result: blockResults[blockId] ?? null,
        needsDelay: delayedResultBlockId === blockId,
      })),
      distinctUntilChanged((a, b) => dequal(a, b)),
      delayErrors({
        shouldDelay$: subject.pipe(
          map(({ delayedResultBlockId }) => delayedResultBlockId === blockId)
        ),
      }),
      pauseWhenOffScreen(element)
    );

    const subscription = results$.subscribe((possiblyDelayed) => {
      setResult(possiblyDelayed.result);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [subject, blockId, element]);

  return result;
};

const pauseWhenOffScreen =
  (target?: Element | null) =>
  <T>(results$: Observable<T>) => {
    if (!target || typeof IntersectionObserver === 'undefined') {
      return results$;
    }

    const onScreen$ = new Observable<boolean>((subscriber) => {
      const options = { rootMargin: '100px' };

      const observer = new IntersectionObserver(([intersection]) => {
        subscriber.next(intersection.isIntersecting);
      }, options);

      observer.observe(target);
      return () => {
        observer.disconnect();
      };
    });

    return onScreen$.pipe(
      switchMap((onScreen) => (onScreen ? results$ : EMPTY))
    );
  };
