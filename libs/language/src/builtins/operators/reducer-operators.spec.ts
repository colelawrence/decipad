import { fromJS } from '../../interpreter/Value';
import { build as t } from '../../type';
import { reducerOperators as operators } from './reducer-operators';

describe('reducer operators', () => {
  it('sumif: sums the elements against boolean elements in a second list', () => {
    expect(
      operators.sumif.functor!([
        t.column(t.number(), 3),
        t.column(t.boolean(), 3),
      ])
    ).toMatchObject(t.number());

    expect(
      operators.sumif.fnValues?.([
        fromJS([1, 2, 3]),
        fromJS([true, false, true]),
      ])
    ).toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(4),
      }
    `);
  });
});
