// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, bench } from 'vitest';
import { operators } from '../operators';
import { FullBuiltinSpec } from '../../types';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { getNums } from './utils';
import { makeContext } from '../../utils/testUtils';

describe('sumif', () => {
  bench('10_000 numbers (random)', async () => {
    await (operators.sumif as FullBuiltinSpec).fnValues?.(
      [
        getNums(10_000),
        Value.fromJS(
          Array(10_000)
            .fill(0)
            .map(() => Math.random() > 0.5)
        ),
      ],
      [],
      makeContext(),
      []
    );
  });

  bench('10_000 numbers (all true)', async () => {
    await (operators.sumif as FullBuiltinSpec).fnValues?.(
      [
        getNums(10_000),
        Value.fromJS(
          Array(10_000)
            .fill(0)
            .map(() => true)
        ),
      ],
      [],
      makeContext(),
      []
    );
  });

  bench('10_000 numbers (all false)', async () => {
    await (operators.sumif as FullBuiltinSpec).fnValues?.(
      [
        getNums(10_000),
        Value.fromJS(
          Array(10_000)
            .fill(0)
            .map(() => false)
        ),
      ],
      [],
      makeContext(),
      []
    );
  });

  bench('100_000 numbers (random)', async () => {
    await (operators.sumif as FullBuiltinSpec).fnValues?.(
      [
        getNums(100_000),
        Value.fromJS(
          Array(100_000)
            .fill(0)
            .map(() => Math.random() > 0.5)
        ),
      ],
      [],
      makeContext(),
      []
    );
  });

  bench('100_000 numbers (all true)', async () => {
    await (operators.sumif as FullBuiltinSpec).fnValues?.(
      [
        getNums(100_000),
        Value.fromJS(
          Array(100_000)
            .fill(0)
            .map(() => true)
        ),
      ],
      [],
      makeContext(),
      []
    );
  });

  bench('100_000 numbers (all false)', async () => {
    await (operators.sumif as FullBuiltinSpec).fnValues?.(
      [
        getNums(100_000),
        Value.fromJS(
          Array(100_000)
            .fill(0)
            .map(() => false)
        ),
      ],
      [],
      makeContext(),
      []
    );
  });
});
