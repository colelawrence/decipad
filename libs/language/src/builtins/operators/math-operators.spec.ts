import Fraction from 'fraction.js';
import { fromJS } from '../../interpreter/Value';
import { build as t } from '../../type';
import { n, l, F } from '../../utils';
import { mathOperators as operators } from './math-operators';

describe('math operators', () => {
  it('rounds a number', () => {
    expect(operators.round.fn?.(F(1.127), F(2)).valueOf()).toBe(1.13);
    expect(operators.round.fn?.(F(112.7), F(0)).valueOf()).toBe(113);
  });

  it('rounds a number and decimal units default to 0', () => {
    expect(operators.round.fn?.(F(112.7)).valueOf()).toBe(113);
  });

  it('rounds down a number with decimal units', () => {
    expect(operators.rounddown.fn?.(F(112.799), F(1)).valueOf()).toBe(112.7);
  });

  it('rounds down a number', () => {
    expect(operators.rounddown.fn?.(F(112.7)).valueOf()).toBe(112);
  });

  it('max of a number is itself', () => {
    expect(operators.max.fnValuesNoAutomap?.([fromJS(2)])).toEqual(fromJS(2));
  });

  it('max of a list of numbers', () => {
    expect(operators.max.fnValuesNoAutomap?.([fromJS([2, 4, 3])])).toEqual(
      fromJS(4)
    );
  });

  it('min of a number is itself', () => {
    expect(operators.min.fnValuesNoAutomap?.([fromJS(2)])).toEqual(fromJS(2));
  });

  it('min of a list of numbers', () => {
    expect(operators.min.fnValuesNoAutomap?.([fromJS([2, 4, 3])])).toEqual(
      fromJS(2)
    );
  });

  it('average of a list of numbers', () => {
    expect(operators.average.fnValuesNoAutomap?.([fromJS([2, 4, 3])])).toEqual(
      fromJS(3)
    );
  });

  it('average of a number is that number', () => {
    expect(operators.average.fnValuesNoAutomap?.([fromJS(2)])).toEqual(
      fromJS(2)
    );
  });

  it('averageif: averages the elements against boolean elements in a second list', () => {
    expect(
      operators.averageif.functorNoAutomap!([
        t.column(t.number(), 3),
        t.column(t.boolean(), 3),
      ])
    ).toMatchObject(t.number());

    expect(
      operators.averageif.fnValuesNoAutomap?.([
        fromJS([1, 2, 3]),
        fromJS([true, false, true]),
      ])
    ).toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(2),
    }
  `);
  });

  it('calculates sqrt', () => {
    expect(operators.sqrt.fn?.(new Fraction(4))).toMatchObject(F(2));
  });

  it("calculates a number's ln", () => {
    expect(operators.ln.fn?.(Math.E)).toBe(1);
  });

  it('exponentiates number with unit', () => {
    expect(
      operators['**'].functor?.(
        [
          t.number([{ unit: 'meters', exp: 1, multiplier: 1, known: false }]),
          t.number(),
        ],

        [l(1), l(2)]
      )
    ).toMatchObject(
      t.number([{ unit: 'meters', exp: 2, multiplier: 1, known: false }])
    );

    expect(
      operators['**'].functor?.(
        [
          t.number([{ unit: 'meters', exp: 1, multiplier: 1, known: false }]),
          t.number(),
        ],

        [l(1), l('hey')]
      )
    ).toMatchObject(t.impossible('exponent value must be a literal number'));

    expect(
      operators['**'].functor?.(
        [
          t.number([{ unit: 'meters', exp: 1, multiplier: 1, known: false }]),
          t.number(),
        ],

        [
          l(1),
          n('function-call', n('funcref', '+'), n('argument-list', l(2), l(2))),
        ]
      )
    ).toMatchObject(t.impossible('exponent value must be a literal number'));
  });
});
