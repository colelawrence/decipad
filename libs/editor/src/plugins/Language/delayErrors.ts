import { from, Observable, of, OperatorFunction, race } from 'rxjs';
import { filter, mapTo, switchMap } from 'rxjs/operators';

import { ComputePanic, ComputeResponse } from '@decipad/language';
import { timeout } from '@decipad/utils';

interface DelayErrorsArgs {
  distinctCursor$: Observable<string | null>;
  getCursor: () => string | null;
  timeoutFn?: (ms: number) => Promise<unknown>;
}

type SimpleRes = ComputeResponse | ComputePanic;

export const delayErrors = ({
  distinctCursor$,
  getCursor,
  timeoutFn = timeout,
}: DelayErrorsArgs): OperatorFunction<SimpleRes, SimpleRes> => {
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

  return switchMap((res: SimpleRes) => {
    const cursor = getCursor();

    if (cursor != null && isErrorUnderCursor(res, cursor)) {
      return mapTo(res)(
        race(
          distinctCursor$.pipe(filter((blockId) => blockId !== cursor)),
          from(waitForNextErrorRevealTime())
        )
      );
    }
    return of(res);
  });
};

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
