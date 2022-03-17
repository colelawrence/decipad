import { from, Observable, of, OperatorFunction, race } from 'rxjs';
import { filter, mapTo, switchMap, distinctUntilChanged } from 'rxjs/operators';

import {
  ComputePanic,
  ComputeResponse,
  IdentifiedResult,
} from '@decipad/language';
import { timeout } from '@decipad/utils';

interface DelayErrorsArgs {
  shouldDelay$: Observable<boolean>;
  timeoutFn?: (ms: number) => Promise<unknown>;
}

type SimpleRes = ComputeResponse | ComputePanic;

export interface SingleBlockRes {
  result: IdentifiedResult;
  needsDelay: boolean;
}

export const delayErrors = ({
  shouldDelay$,
  timeoutFn = timeout,
}: DelayErrorsArgs): OperatorFunction<SingleBlockRes, SingleBlockRes> => {
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

  return switchMap((res: SingleBlockRes) => {
    if (res.needsDelay) {
      return mapTo(res)(
        race(
          shouldDelay$.pipe(
            distinctUntilChanged(),
            filter((shouldDelay) => !shouldDelay)
          ),
          from(waitForNextErrorRevealTime())
        )
      );
    }
    return of(res);
  });
};

export function getDelayedBlockId(
  res: SimpleRes,
  cursorBlockId: string | null
): string | null {
  if (cursorBlockId != null && isErrorUnderCursor(res, cursorBlockId)) {
    return cursorBlockId;
  }
  return null;
}

function isErrorUnderCursor(res: SimpleRes, cursorBlockId: string | null) {
  if (res.type === 'compute-panic') {
    return false;
  }
  const blockUpdate = cursorBlockId
    ? res.updates.find((up) => up.blockId === cursorBlockId)
    : null;
  if (blockUpdate) {
    return (
      blockUpdate.error != null ||
      blockUpdate.results[0]?.type.kind === 'type-error'
    );
  }
  return false;
}
