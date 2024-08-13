import { it, expect } from 'vitest';
import { computeBackendSingleton, serializeResult } from './index';
import DeciNumber from '@decipad/number';

// cd into libs/compute-backend-js and run `npx vitest --run`
it('should sum first 10,000 ints', async () => {
  const column = await serializeResult({
    type: {
      kind: 'column',
      indexedBy: 'number',
      cellType: { kind: 'number' },
    },
    async *value() {
      for (let i = 1; i <= 10000; i++) {
        yield new DeciNumber({ n: BigInt(i), d: 1n, s: 1n });
      }
    },
    meta: undefined,
  });
  const x =
    computeBackendSingleton.computeBackend.sum_result_fraction_column(column);
  expect(x).toEqual(50005000);
});
