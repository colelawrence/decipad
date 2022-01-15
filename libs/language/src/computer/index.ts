import { Observable, of, OperatorFunction } from 'rxjs';
import {
  combineLatestWith,
  concatMap,
  delay,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { dequal } from 'dequal';

import type { Result } from '../result';
import type {
  ComputeRequest,
  ComputeResponse,
  ComputePanic,
  ParsedBlock,
  IdentifiedResult,
  InBlockResult,
  Program,
  ValueLocation,
  UnparsedBlock,
  OptionalValueLocation,
} from './types';
import { Computer } from './Computer';

export { isSyntaxError } from './utils';

export { Computer };

export { serializeResult } from '../result';

type ReqsWithCursor$ = Observable<
  readonly [ComputeRequest, ValueLocation | null]
>;
type ResTuple = [ComputeResponse | ComputePanic, OptionalValueLocation | null];
type Res$ = Observable<ResTuple>;

export type {
  ComputeRequest,
  ComputeResponse,
  ComputePanic,
  InBlockResult,
  IdentifiedResult,
  ParsedBlock,
  Program,
  Result,
  ValueLocation,
  OptionalValueLocation,
  UnparsedBlock,
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
    updateUnderCursor.results.some(({ type }) => type?.kind === 'type-error')
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
export interface ComputeStreamOptions {
  pipeErrors?: () => OperatorFunction<ComputerRet, ComputerRet>;
  computer?: Computer;
}

export const makeComputeStream =
  ({
    pipeErrors = () => delay(2000),
    computer = new Computer(),
  }: ComputeStreamOptions = {}) =>
  (in$: ReqsWithCursor$): Res$ => {
    const req$ = distinctMap(in$, ([req]) => req);
    const cursors$ = distinctMap(in$, ([, cursor]) => cursor);
    const blockIds$ = distinctMap(cursors$, (cursor) => cursor?.[0] ?? '');

    const computeResults$ = req$.pipe(
      concatMap(async (req) => computer.compute(req)),
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
