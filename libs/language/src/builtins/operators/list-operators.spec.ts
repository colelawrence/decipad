import { fromJS } from '../../interpreter/Value';
import { build as t } from '../../type';
import { listOperators as operators } from './list-operators';

describe('list operators', () => {
  it('concatenates lists', () => {
    expect(
      operators.cat
        .fnValuesNoAutomap?.([fromJS([1, 2, 3]), fromJS([4, 5, 6])])
        .getData()
    ).toMatchInlineSnapshot(`
    Array [
      Fraction(1),
      Fraction(2),
      Fraction(3),
      Fraction(4),
      Fraction(5),
      Fraction(6),
    ]
  `);

    expect(
      operators.cat.fnValuesNoAutomap?.([fromJS(1), fromJS([2, 3])]).getData()
    ).toMatchInlineSnapshot(`
    Array [
      Fraction(1),
      Fraction(2),
      Fraction(3),
    ]
  `);

    expect(
      operators.cat.fnValuesNoAutomap?.([fromJS([1, 2]), fromJS(3)]).getData()
    ).toMatchInlineSnapshot(`
    Array [
      Fraction(1),
      Fraction(2),
      Fraction(3),
    ]
  `);
  });

  it('calculates columns and scalar lengths', () => {
    expect(operators.len.functorNoAutomap?.([t.number()])).toMatchObject(
      t.number()
    );

    expect(operators.len.fnValuesNoAutomap?.([fromJS(2)]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(1),
    }
  `);

    expect(
      operators.len.functorNoAutomap?.([t.column(t.number(), 3)])
    ).toMatchObject(t.number());

    expect(operators.len.fnValuesNoAutomap?.([fromJS([1, 2, 3])]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(3),
    }
  `);
  });

  it('retrieves the first element of a list', () => {
    expect(operators.first.fnValuesNoAutomap?.([fromJS(2)]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(2),
    }
  `);

    expect(operators.first.fnValuesNoAutomap?.([fromJS([4, 5, 6])]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(4),
    }
  `);
  });

  it('retrieves the last element of a list', () => {
    expect(operators.last.fnValuesNoAutomap?.([fromJS(2)]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(2),
    }
  `);

    expect(operators.last.fnValuesNoAutomap?.([fromJS([4, 5, 6])]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(6),
    }
  `);
  });

  it('count: counts the number of elements in a list', () => {
    expect(
      operators.count.functorNoAutomap!([t.column(t.number(), 3)])
    ).toMatchObject(t.number());

    expect(operators.countif.fnValuesNoAutomap?.([fromJS([1, 2, 3])]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(3),
    }
  `);
  });

  it('countif: counts the true elements in a list', () => {
    expect(
      operators.countif.functorNoAutomap!([t.column(t.boolean(), 3)])
    ).toMatchObject(t.number());

    expect(operators.countif.fnValuesNoAutomap?.([fromJS([true, false, true])]))
      .toMatchInlineSnapshot(`
    FractionValue {
      "value": Fraction(2),
    }
  `);
  });
});
