import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { buildType as t, Value } from '@decipad/language-types';
import { roundOperators as operators } from './round-operators';
import { makeContext, U } from '../utils/testUtils';
import { FullBuiltinSpec } from '../interfaces';

describe('round', () => {
  const round = operators.round as FullBuiltinSpec;
  it('rounds a number', async () => {
    expect(
      await round.functor?.([t.number(U('bananas'))], [], makeContext())
    ).toEqual(t.number(U('bananas')));
    expect(
      (
        await (
          await round.fnValues!(
            [Value.fromJS(N(1127, 1000)), Value.fromJS(N(2))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(1.13);
    expect(
      (
        await (
          await round.fnValues!(
            [Value.fromJS(N(1127, 10)), Value.fromJS(N(0))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(113);
  });

  it('rounds a number and decimal units default to 0', async () => {
    expect(
      (
        await (
          await round.fnValues!(
            [Value.fromJS(N(1127, 10))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(113);
  });

  it('rounds a number with decimal units', async () => {
    expect(
      (
        await (
          await round.fnValues!(
            [Value.fromJS(N(112799, 1000)), Value.fromJS(N(1))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(112.8);
  });

  it('rounds a number with decimal units (0)', async () => {
    expect(
      (
        await (
          await round.fnValues!(
            [Value.fromJS(N(112799, 1000)), Value.fromJS(N(0))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(113);
  });

  it('rounds a number with decimal units (-2)', async () => {
    expect(
      (
        await (
          await round.fnValues!(
            [Value.fromJS(N(112799, 1000)), Value.fromJS(N(-2))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(100);
  });

  it('rounds a number with decimal units (-5)', async () => {
    expect(
      (
        await (
          await round.fnValues!(
            [Value.fromJS(N(112799, 1000)), Value.fromJS(N(-5))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(0);
  });

  it('rounds down a number with decimal units', async () => {
    expect(
      (
        await (
          await (operators.rounddown as FullBuiltinSpec).fnValues!(
            [Value.fromJS(N(112799, 1000)), Value.fromJS(N(1))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(112.7);
  });

  it('rounds down a number', async () => {
    expect(
      (
        await (
          await (operators.rounddown as FullBuiltinSpec).fnValues!(
            [Value.fromJS(N(1127, 10))],
            [t.number()],
            makeContext()
          )
        ).getData()
      )?.valueOf()
    ).toBe(112);
  });
});
