import { Observable, of } from 'rxjs';
import {
  combineLatestWith,
  concatMap,
  delay,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { dequal } from 'dequal';

import type {
  ComputeRequest,
  ComputeResponse,
  ComputePanic,
  IdentifiedResult,
  InBlockResult,
  ValueLocation,
} from './types';
import { Computer } from './Computer';

type ReqsWithCursor$ = Observable<[ComputeRequest, ValueLocation | null]>;
type ResTuple = [ComputeResponse | ComputePanic, ValueLocation | null];
type Res$ = Observable<ResTuple>;

export type {
  ComputeRequest,
  ComputeResponse,
  ComputePanic,
  InBlockResult,
  IdentifiedResult,
};

// We need to delay errors which are under the cursor, so the user can stop typing
export const getShouldDelayResponse = (
  response: ComputeResponse | ComputePanic,
  currentBlockId?: string | null
) => {
  if (response.type === 'compute-panic') return false;

  const updateUnderCursor = response.updates.find(
    (upd) => upd.blockId === currentBlockId
  );

  if (updateUnderCursor == null) return false;

  return (
    updateUnderCursor.isSyntaxError ||
    updateUnderCursor.results.some(
      ({ valueType }) => valueType.errorCause != null
    )
  );
};

const distinctMap = <In, Out>(
  input: Observable<In>,
  project: (item: In) => Out
): Observable<Out> =>
  input.pipe(
    map((item) => project(item)),
    distinctUntilChanged(dequal)
  );

type ComputerRet = ComputeResponse | ComputePanic;
export interface MakeComputerOptions {
  pipeErrors?: () => (
    inObs: Observable<ComputerRet>
  ) => Observable<ComputerRet>;
}
export const makeComputer =
  ({ pipeErrors = () => delay(2000) }: MakeComputerOptions = {}) =>
  (in$: ReqsWithCursor$): Res$ => {
    const computer = new Computer();

    const req$ = distinctMap(in$, ([req]) => req);
    const cursors$ = distinctMap(in$, ([_, cursor]) => cursor);
    const blockIds$ = distinctMap(cursors$, (cursor) => cursor?.[0] ?? '');

    const computeResults$ = req$.pipe(
      concatMap(async (req) => await computer.compute(req)),
      // Bring in the block IDs, which don't trigger more computes
      // but help us figure out the important errors
      combineLatestWith(blockIds$),
      // Debounce showing errors by 2 seconds. Moving the cursor out of
      // the block will cancel this debounce (through another item in
      // blockId$)
      switchMap(([computeRes, blockId]) => {
        if (getShouldDelayResponse(computeRes, blockId)) {
          return of(computeRes).pipe(pipeErrors());
        } else {
          return of(computeRes);
        }
      }),
      // Bring in the cursors
      combineLatestWith(cursors$),
      // Figure out where the cursor is now in terms of statement, not line.
      map(
        ([computeRes, cursor]): ResTuple => [
          computeRes,
          computer.cursorPosToValueLocation(cursor),
        ]
      )
    );

    return computeResults$;
  };
