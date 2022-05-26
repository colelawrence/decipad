import { EMPTY, firstValueFrom, from, Observable } from 'rxjs';

import { buildType as t, serializeType } from '@decipad/language';
import { timeout } from '@decipad/utils';
import { getDelayedBlockId } from '.';

import { delayErrors, SingleBlockRes } from './delayErrors';

const goodRes: SingleBlockRes = {
  result: {
    blockId: 'blockId',
    error: undefined,
    isSyntaxError: false,
    results: [
      {
        type: serializeType(t.number()),
        blockId: 'blockId',
        statementIndex: 0,
        value: null,
        visibleVariables: {
          global: new Set(),
          local: new Set(),
        },
      },
    ],
  },
  needsDelay: false,
};
const errorRes: SingleBlockRes = {
  result: {
    blockId: 'blockId',
    error: undefined,
    isSyntaxError: false,
    results: [
      {
        type: serializeType(t.impossible('type error!')),
        blockId: 'blockId',
        statementIndex: 0,
        value: null,
        visibleVariables: {
          global: new Set(),
          local: new Set(),
        },
      },
    ],
  },
  needsDelay: true,
};

/* like of() but doesn't complete */
const incompleteOf = <T>(item: T) =>
  new Observable<T>((subscriber) => {
    subscriber.next(item);
  });

let timeoutFn = () => Promise.resolve();
beforeEach(() => {
  timeoutFn = jest.fn(() => timeout(0));
});

it('does not delay non-error results', async () => {
  const stream = incompleteOf(goodRes).pipe(
    delayErrors({
      shouldDelay$: EMPTY,
      timeoutFn,
    })
  );

  expect(await firstValueFrom(stream)).toEqual(goodRes);
  expect(timeoutFn).not.toHaveBeenCalled();
});

describe('error results', () => {
  it('pipes out an error instantly, if it came from another block ID different from the cursor', async () => {
    const stream = incompleteOf(errorRes).pipe(
      delayErrors({
        shouldDelay$: incompleteOf(false),
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toEqual(errorRes);
  });

  it('delays errors, until the timeout passes', async () => {
    const stream = incompleteOf(errorRes).pipe(
      delayErrors({
        shouldDelay$: incompleteOf(false),
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toEqual(errorRes);
    expect(timeoutFn).toHaveBeenCalledTimes(1);
  });

  it('error delay can be interrupted by a cursor move', async () => {
    expect.assertions(4);

    let firstValue = null;

    const stream = incompleteOf(errorRes).pipe(
      delayErrors({
        shouldDelay$: from(
          (function* yieldBlockIdsWhileChecking() {
            expect(firstValue).toEqual(null);
            yield true;
            expect(firstValue).toEqual(null);
            yield false;
            expect(false).toEqual(true); // This won't run
          })()
        ),
        timeoutFn,
      })
    );

    firstValue = await firstValueFrom(stream);

    expect(firstValue).toEqual(errorRes);
    expect(timeoutFn).toHaveBeenCalled();
  });

  it("multiple errors don't cause further delays", async () => {
    const finalError = { ...errorRes };
    const stream = from([errorRes, errorRes, finalError]).pipe(
      delayErrors({
        shouldDelay$: incompleteOf(true),
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toBe(finalError);
    expect(timeoutFn).toHaveBeenCalledTimes(1);
  });

  it('error delays can be interrupted by a good result', async () => {
    const stream = from([errorRes, goodRes]).pipe(
      delayErrors({
        shouldDelay$: incompleteOf(true),
        timeoutFn,
      })
    );

    expect(await firstValueFrom(stream)).toBe(goodRes);
    expect(timeoutFn).toHaveBeenCalledTimes(1);
  });
});

describe('getDelayedBlockId', () => {
  it('delays errors under cursor', () => {
    expect(
      getDelayedBlockId(
        {
          type: 'compute-response',
          indexLabels: new Map(),
          updates: [errorRes.result],
        },
        'blockId'
      )
    ).toEqual('blockId');
  });
  it('does not delay good results', () => {
    expect(
      getDelayedBlockId(
        {
          type: 'compute-response',
          indexLabels: new Map(),
          updates: [goodRes.result],
        },
        'blockId'
      )
    ).toEqual(null);
  });
  it('does not delay panics', () => {
    expect(
      getDelayedBlockId({ type: 'compute-panic', message: '' }, 'blockid')
    ).toEqual(null);
  });
});
