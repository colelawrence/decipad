import { lastValueFrom, from } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import {
  ComputeRequest,
  ComputeResponse,
  InBlockResult,
  ValueLocation,
} from './types';
import {
  getShouldDelayResponse,
  makeComputeStream,
  ComputeStreamOptions,
} from '.';
import { getUnparsed, simplifyComputeResponse } from './testutils';

const makeReqs = (things: string[]): ComputeRequest[] =>
  things.map((source) => ({
    program: [{ id: 'block-0', type: 'unparsed-block', source }],
  }));

const makeMultiBlockReqs = (things: string[][]): ComputeRequest[] =>
  things.map((blockSources) => ({
    program: getUnparsed(...blockSources),
  }));

const runThroughMock = async (
  reqs: ComputeRequest[],
  cursorPositions?: (ValueLocation | null)[],
  computerOptions?: ComputeStreamOptions
): Promise<string[][]> =>
  lastValueFrom(
    from(reqs).pipe(
      map((t, index) => [t, cursorPositions?.[index] ?? null] as const),
      makeComputeStream(computerOptions),
      map(([res]) => simplifyComputeResponse(res)),
      toArray()
    )
  );

it('can run requests through a computer', async () => {
  expect(
    await runThroughMock(makeReqs(['A = 1', 'Syntax ---- / --- Error']))
  ).toEqual([['block-0/0 -> 1'], ['block-0 -> Syntax Error']]);
});

it('Always yields the whole response, even if parts of it did not change', async () => {
  const reqs = makeMultiBlockReqs([
    ['A = 1', '1 + 1'],
    ['A = 2', '1 + 1'],
  ]);

  expect(await runThroughMock(reqs)).toEqual([
    ['block-0/0 -> 1', 'block-1/0 -> 2'],
    ['block-0/0 -> 2', 'block-1/0 -> 2'],
  ]);
});

it('delays requests which are errored and under the cursor', async () => {
  const options: ComputeStreamOptions = {
    pipeErrors: jest.fn(() => (x) => x),
  };
  await runThroughMock(makeReqs(['Syntax ---- / --- Error']), [null], options);
  expect(options.pipeErrors).not.toHaveBeenCalled();

  await runThroughMock(
    makeReqs(['Syntax ---- / --- Error']),
    [['block-0', 1]],
    options
  );
  expect(options.pipeErrors).toHaveBeenCalled();
});

it('getShouldDelayResponse returns true for if there is an error under the cursor', async () => {
  expect(
    getShouldDelayResponse({
      type: 'compute-panic',
    })
  ).toEqual(false);

  const syntaxError: ComputeResponse = {
    type: 'compute-response',
    indexLabels: new Map(),
    updates: [
      {
        blockId: 'block-0',
        isSyntaxError: true,
        results: [],
      },
    ],
  };

  // Not under the current cursor
  expect(getShouldDelayResponse(syntaxError, null)).toEqual(false);
  // Under the cursor, let's wait
  expect(getShouldDelayResponse(syntaxError, 'block-0')).toEqual(true);

  const typeError: ComputeResponse = {
    type: 'compute-response',
    indexLabels: new Map(),
    updates: [
      {
        blockId: 'block-0',
        isSyntaxError: false,
        results: [
          {
            valueType: { errorCause: 'yes' },
          } as unknown as InBlockResult,
        ],
      },
    ],
  };

  expect(getShouldDelayResponse(typeError, 'block-0')).toEqual(true);
});
