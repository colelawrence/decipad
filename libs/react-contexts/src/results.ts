import React, { ReactNode, useEffect, useState } from 'react';
import { distinctUntilChanged, EMPTY, map, Observable, switchMap } from 'rxjs';
import { dequal } from 'dequal';

import {
  IdentifiedResult,
  delayErrors,
  defaultComputerResults,
  Computer,
  IdentifiedError,
} from '@decipad/computer';
import { ComputerContextProvider, useComputer } from './computer';

export interface ResultsContextItem {
  readonly blockResults: {
    readonly [blockId: string]: Readonly<IdentifiedResult | IdentifiedError>;
  };
  readonly indexLabels: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly delayedResultBlockId: string | null;
}

/** A computer provider with a value for tests */
export const TestResultsProvider: React.FC<
  Partial<ResultsContextItem> & { children?: ReactNode }
> = ({ children, ...contextItem }) => {
  const computer = new Computer();
  computer.results.next({
    ...defaultComputerResults,
    ...contextItem,
  });
  return React.createElement(ComputerContextProvider, { computer }, children);
};

/**
 * Obtain a code line's result from the results context.
 * Errors are debounced if the cursor is in this line, for UX reasons.
 * */
export const useResult = (
  blockId: string,
  element?: Element | null
): IdentifiedError | IdentifiedResult | null => {
  const subject = useComputer().results;
  const [result, setResult] = useState<
    IdentifiedResult | IdentifiedError | null
  >(() => subject.getValue().blockResults[blockId] ?? null);

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
