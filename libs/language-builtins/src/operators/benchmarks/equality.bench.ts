// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, bench } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { getNums } from './utils';
import { operators } from '../operators';
import { FullBuiltinSpec } from '../../types';
import { makeContext } from '../../utils/testUtils';

describe('equality', () => {
  bench('1_000 numbers (equal)', async () => {
    await (operators['=='] as FullBuiltinSpec).fnValues?.(
      [getNums(1_000, 0), getNums(10_000, 0)],
      [],
      makeContext(),
      []
    );
  });

  bench('1_000 numbers (not equal)', async () => {
    await (operators['=='] as FullBuiltinSpec).fnValues?.(
      [getNums(1_000), getNums(10_000)],
      [],
      makeContext(),
      []
    );
  });
});
