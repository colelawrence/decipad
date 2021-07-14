import { lastValueFrom, from } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import {
  ComputeRequest,
  ComputeResponse,
  InBlockResult,
  ValueLocation,
} from './types';
import { getShouldDelayResponse, makeComputer, MakeComputerOptions } from '.';
import { simplifyComputeResponse } from './testutils';

const runThroughMock = async (
  things: string[],
  cursorPositions?: (ValueLocation | null)[],
  computerOptions?: MakeComputerOptions
): Promise<string[][]> => {
  const reqs: ComputeRequest[] = things.map((source) => ({
    type: 'compute-request',
    program: [{ id: 'block-0', source }],
  }));

  const thingsStream = from(reqs).pipe(
    map((t, index): [ComputeRequest, ValueLocation | null] => [
      t,
      cursorPositions?.[index] ?? null,
    ]),
    makeComputer(computerOptions),
    map(([res]) => {
      return simplifyComputeResponse(res);
    }),
    toArray()
  );

  return await lastValueFrom(thingsStream);
};

it('can run requests through a computer', async () => {
  expect(await runThroughMock(['A = 1', 'Syntax ---- / --- Error'])).toEqual([
    ['block-0/0 -> 1'],
    ['block-0 -> Syntax Error'],
  ]);
});

it('delays requests which are errored and under the cursor', async () => {
  const options: MakeComputerOptions = {
    pipeErrors: jest.fn(() => (x) => x),
  };
  await runThroughMock(['Syntax ---- / --- Error'], [null], options);
  expect(options.pipeErrors).not.toHaveBeenCalled();

  await runThroughMock(['Syntax ---- / --- Error'], [['block-0', 1]], options);
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
    updates: [
      {
        blockId: 'block-0',
        isSyntaxError: false,
        results: [
          {
            valueType: { errorCause: 'yes' },
          } as any as InBlockResult,
        ],
      },
    ],
  };

  expect(getShouldDelayResponse(typeError, 'block-0')).toEqual(true);
});
