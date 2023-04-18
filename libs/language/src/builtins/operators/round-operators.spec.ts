import { N } from '@decipad/number';
import { buildType as t } from '../../type';
import { U } from '../../utils';
import { fromJS } from '../../value';
import { roundOperators as operators } from './round-operators';

describe('round', () => {
  it('rounds a number', () => {
    expect(operators.round.functor?.([t.number(U('bananas'))])).toEqual(
      t.number(U('bananas'))
    );
    expect(
      operators.round.fnValues!(
        [fromJS(N(1127, 1000)), fromJS(N(2))],
        [t.number()]
      )
        .getData()
        ?.valueOf()
    ).toBe(1.13);
    expect(
      operators.round.fnValues!(
        [fromJS(N(1127, 10)), fromJS(N(0))],
        [t.number()]
      )
        .getData()
        ?.valueOf()
    ).toBe(113);
  });

  it('rounds a number and decimal units default to 0', () => {
    expect(
      operators.round.fnValues!([fromJS(N(1127, 10))], [t.number()])
        .getData()
        ?.valueOf()
    ).toBe(113);
  });

  it('rounds a number with decimal units', () => {
    expect(
      operators.round.fnValues!(
        [fromJS(N(112799, 1000)), fromJS(N(1))],
        [t.number()]
      )
        .getData()
        ?.valueOf()
    ).toBe(112.8);
  });

  it('rounds a number with decimal units (0)', () => {
    expect(
      operators.round.fnValues!(
        [fromJS(N(112799, 1000)), fromJS(N(0))],
        [t.number()]
      )
        .getData()
        ?.valueOf()
    ).toBe(113);
  });

  it('rounds a number with decimal units (-2)', () => {
    expect(
      operators.round.fnValues!(
        [fromJS(N(112799, 1000)), fromJS(N(-2))],
        [t.number()]
      )
        .getData()
        ?.valueOf()
    ).toBe(100);
  });

  it('rounds a number with decimal units (-5)', () => {
    expect(
      operators.round.fnValues!(
        [fromJS(N(112799, 1000)), fromJS(N(-5))],
        [t.number()]
      )
        .getData()
        ?.valueOf()
    ).toBe(0);
  });

  it('rounds down a number with decimal units', () => {
    expect(
      operators.rounddown.fnValues!(
        [fromJS(N(112799, 1000)), fromJS(N(1))],
        [t.number()]
      )
        .getData()
        ?.valueOf()
    ).toBe(112.7);
  });

  it('rounds down a number', () => {
    expect(
      operators.rounddown.fnValues!([fromJS(N(1127, 10))], [t.number()])
        .getData()
        ?.valueOf()
    ).toBe(112);
  });
});
