// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, bench } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { getNums } from './utils';
import { operators } from '../operators';
import { FullBuiltinSpec } from '../../types';
import { makeContext } from '../../utils/testUtils';

describe('mediam', () => {
  bench('10_000 numbers', async () => {
    await (operators.median as FullBuiltinSpec).fnValues?.(
      [getNums(10_000)],
      [],
      makeContext(),
      []
    );
  });

  bench('100_000 numbers', async () => {
    await (operators.median as FullBuiltinSpec).fnValues?.(
      [getNums(100_000)],
      [],
      makeContext(),
      []
    );
  });
});
