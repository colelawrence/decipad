// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, bench } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { getNums } from './utils';
import { operators } from '../operators';
import { FullBuiltinSpec } from '../../types';
import { makeContext } from '../../utils/testUtils';

describe('unique', () => {
  bench('100 numbers (random)', async () => {
    await (operators.unique as FullBuiltinSpec).fnValues?.(
      [getNums(100)],
      [],
      makeContext(),
      []
    );
  });

  bench('500 numbers (same)', async () => {
    await (operators.unique as FullBuiltinSpec).fnValues?.(
      [getNums(500, 0)],
      [],
      makeContext(),
      []
    );
  });

  bench('100 numbers (random)', async () => {
    await (operators.unique as FullBuiltinSpec).fnValues?.(
      [getNums(100)],
      [],
      makeContext(),
      []
    );
  });

  bench('500 numbers (same)', async () => {
    await (operators.unique as FullBuiltinSpec).fnValues?.(
      [getNums(500, 0)],
      [],
      makeContext(),
      []
    );
  });
});
