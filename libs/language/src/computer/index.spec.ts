import { lastValueFrom, from } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { ComputeRequest, ComputeResponse } from './types';
import { makeComputer } from '.';

const runThroughMock = async (things: string[]): Promise<string[]> => {
  const reqs: ComputeRequest[] = things.map((source) => ({
    type: 'compute-request',
    program: [{ id: '0', source }],
  }));

  const thingsStream = from(reqs).pipe(
    map((t): [ComputeRequest, null] => [t, null]),
    makeComputer(),
    map(([t]) => {
      if (t.type === 'compute-panic') {
        throw new Error('compute panic' + t.message);
      }

      expect(t.updates.length).toEqual(1);
      if (t.updates[0].isSyntaxError) {
        return 'syntax error';
      }

      expect(t.updates[0].results.length).toEqual(1);
      return (t as ComputeResponse).updates[0].results[0].value;
    }),
    toArray()
  );

  return await lastValueFrom(thingsStream);
};

it('can run requests through a computer', async () => {
  expect(await runThroughMock(['A = 1', 'Syntax ---- / --- Error'])).toEqual([
    1,
    'syntax error',
  ]);
});
