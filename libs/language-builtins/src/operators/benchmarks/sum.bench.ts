/* eslint-disable import/no-extraneous-dependencies */
import { describe, bench } from 'vitest';
import { operators } from '../operators';
import { FullBuiltinSpec } from '../../types';
import { getNums } from './utils';
import { makeContext } from '../../utils/testUtils';

describe('sum', () => {
  bench('10_000 numbers', async () => {
    await (operators.total as FullBuiltinSpec).fnValues?.(
      [getNums(10_000)],
      [],
      makeContext(),
      []
    );
  });

  bench('100_000 numbers', async () => {
    await (operators.total as FullBuiltinSpec).fnValues?.(
      [getNums(100_000)],
      [],
      makeContext(),
      []
    );
  });
});
