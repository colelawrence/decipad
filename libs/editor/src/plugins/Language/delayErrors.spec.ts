import { EMPTY, firstValueFrom, from, Observable } from 'rxjs';

import {
  buildType,
  ComputePanic,
  ComputeResponse,
  serializeType,
} from '@decipad/language';
import { timeout } from '@decipad/utils';

import { delayErrors } from './delayErrors';

const goodRes: ComputeResponse = {
  type: 'compute-response',
  updates: [],
  indexLabels: new Map(),
};
const errorRes: ComputeResponse = {
  type: 'compute-response',
  updates: [
    {
      blockId: 'blockId',
      error: undefined,
      isSyntaxError: false,
      results: [
        {
          type: serializeType(buildType.impossible('type error!')),
          blockId: 'blockId',
          statementIndex: 0,
          value: null,
        },
      ],
    },
  ],
  indexLabels: new Map(),
};
const panicRes: ComputePanic = { type: 'compute-panic' };

/* like of() but doesn't complete */
const incompleteOf = <T>(item: T) =>
  new Observable<T>((subscriber) => {
    subscriber.next(item);
  });

it('does not delay non-error results', async () => {
  const timeoutFn = jest.fn();
  const stream = incompleteOf(goodRes).pipe(
    delayErrors({
      distinctCursor$: EMPTY,
      getCursor: () => null,
      timeoutFn,
    })
  );

  expect(await firstValueFrom(stream)).toEqual(goodRes);
  expect(timeoutFn).not.toHaveBeenCalled();
});

it('does not delay a panic', async () => {
  const timeoutFn = jest.fn();
  const stream = incompleteOf(panicRes).pipe(
    delayErrors({
      distinctCursor$: EMPTY,
      getCursor: () => null,
      timeoutFn,
    })
  );

  expect(await firstValueFrom(stream)).toEqual(panicRes);
  expect(timeoutFn).not.toHaveBeenCalled();
});

describe('error results', () => {
  it('pipes out an error instantly, if it came from another block ID different from the cursor', async () => {
    const timeoutFn = jest.fn();

    const stream = incompleteOf(errorRes).pipe(
      delayErrors({
        distinctCursor$: EMPTY,
        getCursor: () => 'another-block-id',
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toEqual(errorRes);
    expect(timeoutFn).not.toHaveBeenCalled();
  });

  it('delays errors, until the timeout passes', async () => {
    const timeoutFn = jest.fn(() => timeout(0));

    const stream = incompleteOf(errorRes).pipe(
      delayErrors({
        distinctCursor$: incompleteOf('fake block id stream'),
        getCursor: () => 'blockId',
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toEqual(errorRes);
    expect(timeoutFn).toHaveBeenCalledTimes(1);
  });

  it('error delay can be interrupted by a cursor move', async () => {
    expect.assertions(4);

    let firstValue = null;

    const timeoutFn = jest.fn(timeout);

    const stream = incompleteOf(errorRes).pipe(
      delayErrors({
        distinctCursor$: from(
          (function* yieldBlockIdsWhileChecking() {
            expect(firstValue).toEqual(null);
            yield 'blockId';
            expect(firstValue).toEqual(null);
            yield 'blockId2';
            expect(false).toEqual(true); // This won't run
          })()
        ),
        getCursor: () => 'blockId',
        timeoutFn,
      })
    );

    firstValue = await firstValueFrom(stream);

    expect(firstValue).toEqual(errorRes);
    expect(timeoutFn).toHaveBeenCalled();
  });

  it("multiple errors don't cause further delays", async () => {
    const timeoutFn = jest.fn(() => timeout(0));

    const finalError = { ...errorRes };
    const stream = from([errorRes, errorRes, finalError]).pipe(
      delayErrors({
        distinctCursor$: incompleteOf('blockId'),
        getCursor: () => 'blockId',
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toBe(finalError);
    expect(timeoutFn).toHaveBeenCalledTimes(1);
  });

  it('error delays can be interrupted by a good result', async () => {
    const timeoutFn = jest.fn(() => timeout(0));

    const stream = from([errorRes, goodRes]).pipe(
      delayErrors({
        distinctCursor$: incompleteOf('blockId'),
        getCursor: () => 'blockId',
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toBe(goodRes);
    expect(timeoutFn).toHaveBeenCalledTimes(1);
  });
});
