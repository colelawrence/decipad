import { from, Observable, of, OperatorFunction, race } from 'rxjs';
import {
  filter,
  switchMap,
  distinctUntilChanged,
  map,
  take,
} from 'rxjs/operators';

import { timeout } from '@decipad/utils';
import type {
  ComputePanic,
  ComputeResponse,
  IdentifiedError,
  IdentifiedResult,
} from '../types';

interface DelayErrorsArgs {
  shouldDelay$: Observable<boolean>;
  timeoutFn?: (ms: number) => Promise<unknown>;
}

type SimpleRes = ComputeResponse | ComputePanic;

export interface DelayableResult {
  result?: IdentifiedResult | IdentifiedError;
  needsDelay: boolean;
}

export const delayErrors = ({
  shouldDelay$,
  timeoutFn = timeout,
}: DelayErrorsArgs): OperatorFunction<DelayableResult, DelayableResult> => {
  /* How many ms do we delay revealing an error under the cursor */
  const errorRevealDelay = 2000;
  /** If another call to this function is already waiting, wait alongside it.
   * Use a shared promise to achieve this more easily. */
  let nextErrorReveal: Promise<unknown> | null = null;
  const waitForNextErrorRevealTime = async () => {
    if (!nextErrorReveal) {
      nextErrorReveal = timeoutFn(errorRevealDelay);
    }
    await nextErrorReveal;
    // Further calls should wait again
    nextErrorReveal = null;
  };

  return switchMap((res: DelayableResult) => {
    if (res.needsDelay) {
      const shouldNotDelayAnymore = race(
        shouldDelay$.pipe(
          distinctUntilChanged(),
          filter((shouldDelay) => !shouldDelay)
        ),
        from(waitForNextErrorRevealTime())
      ).pipe(take(1));

      return shouldNotDelayAnymore.pipe(map(() => res));
    }
    return of(res);
  });
};

export function getDelayedBlockId(
  res: SimpleRes,
  cursorBlockId?: string
): string | undefined {
  if (cursorBlockId != null && isErrorUnderCursor(res, cursorBlockId)) {
    return cursorBlockId;
  }
  return undefined;
}

function isErrorUnderCursor(res: SimpleRes, cursorBlockId: string) {
  if (res.type === 'compute-panic') {
    return false;
  }
  const blockUpdate = res.updates.find((up) => up.id === cursorBlockId);
  if (blockUpdate) {
    return (
      blockUpdate.error != null || blockUpdate.result.type.kind === 'type-error'
    );
  }
  return false;
}
