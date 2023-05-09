import { N } from '@decipad/number';
import { buildType as t } from '../../type';
import { U } from '../../utils';
import { fromJS } from '../../value';
import { roundOperators as operators } from './round-operators';

describe('round', () => {
  it('rounds a number', async () => {
    expect(await operators.round.functor?.([t.number(U('bananas'))])).toEqual(
      t.number(U('bananas'))
    );
    expect(
      (
        await (
          await operators.round.fnValues!(
            [fromJS(N(1127, 1000)), fromJS(N(2))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(1.13);
    expect(
      (
        await (
          await operators.round.fnValues!(
            [fromJS(N(1127, 10)), fromJS(N(0))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(113);
  });

  it('rounds a number and decimal units default to 0', async () => {
    expect(
      (
        await (
          await operators.round.fnValues!([fromJS(N(1127, 10))], [t.number()])
        ).getData()
      )?.valueOf()
    ).toBe(113);
  });

  it('rounds a number with decimal units', async () => {
    expect(
      (
        await (
          await operators.round.fnValues!(
            [fromJS(N(112799, 1000)), fromJS(N(1))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(112.8);
  });

  it('rounds a number with decimal units (0)', async () => {
    expect(
      (
        await (
          await operators.round.fnValues!(
            [fromJS(N(112799, 1000)), fromJS(N(0))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(113);
  });

  it('rounds a number with decimal units (-2)', async () => {
    expect(
      (
        await (
          await operators.round.fnValues!(
            [fromJS(N(112799, 1000)), fromJS(N(-2))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(100);
  });

  it('rounds a number with decimal units (-5)', async () => {
    expect(
      (
        await (
          await operators.round.fnValues!(
            [fromJS(N(112799, 1000)), fromJS(N(-5))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(0);
  });

  it('rounds down a number with decimal units', async () => {
    expect(
      (
        await (
          await operators.rounddown.fnValues!(
            [fromJS(N(112799, 1000)), fromJS(N(1))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(112.7);
  });

  it('rounds down a number', async () => {
    expect(
      (
        await (
          await operators.rounddown.fnValues!(
            [fromJS(N(1127, 10))],
            [t.number()]
          )
        ).getData()
      )?.valueOf()
    ).toBe(112);
  });
});
