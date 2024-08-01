/* eslint-disable no-restricted-imports */
import { bench } from 'vitest';
import { computeBackendSingleton, serializeResult } from './index';
import { DeciNumber } from '@decipad/number';
import { operators } from '@decipad/language-builtins';
import { makeContext } from '../../language-builtins/src/utils/testUtils';
import type { FullBuiltinSpec } from '../../language-builtins/src/types';
import { Value } from '@decipad/language-types';

// cd into libs/compute-backend-js and run `npx vitest bench`
const column = await serializeResult({
  type: {
    kind: 'column',
    indexedBy: 'number',
    cellType: { kind: 'number' },
  },
  async *value() {
    for (let i = 1; i <= 2; i++) {
      yield new DeciNumber({ n: BigInt(i), d: 1n, s: 1n });
    }
  },
});

bench('wasm sum first million ints', async () => {
  computeBackendSingleton.computeBackend.sum_result_fraction_column(column);
});

const ary = Array.from(new Array(11).keys());
const x = Value.fromJS(ary);

bench('ts sum first million ints', async () => {
  await (operators.total as FullBuiltinSpec).fnValues?.(
    [x],
    [],
    makeContext(),
    []
  );
});
