import { EMPTY, firstValueFrom, from, Observable } from 'rxjs';

import { buildType as t, serializeType } from '@decipad/language';
import { getDefined, timeout } from '@decipad/utils';
import { getDelayedBlockId } from '.';

import { delayErrors, DelayableResult } from './delayErrors';

const goodRes: DelayableResult = {
  result: {
    type: 'computer-result',
    id: 'blockId',
    result: {
      type: serializeType(t.number()),
      value: null,
    },
  },
  needsDelay: false,
};
const errorRes: DelayableResult = {
  result: {
    type: 'computer-result',
    id: 'blockId',
    result: {
      type: serializeType(t.impossible('type error!')),
      value: null,
    },
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

    let firstValue;

    const stream = incompleteOf(errorRes).pipe(
      delayErrors({
        shouldDelay$: from(
          (function* yieldBlockIdsWhileChecking() {
            expect(firstValue).toBe(undefined);
            yield true;
            expect(firstValue).toBe(undefined);
            yield false;
            expect(false).toBe(true); // This won't run
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
          updates: [getDefined(errorRes.result)],
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
          updates: [getDefined(goodRes.result)],
        },
        'blockId'
      )
    ).toBe(undefined);
  });
  it('does not delay panics', () => {
    expect(
      getDelayedBlockId({ type: 'compute-panic', message: '' }, 'blockid')
    ).toBe(undefined);
  });
});
