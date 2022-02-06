import { Table, fromJS } from '../../interpreter/Value';
import { build as t } from '../../type';
import { U } from '../../utils';
import { listOperators as operators } from './list-operators';

describe('list operators', () => {
  it('concatenates lists', () => {
    expect(operators.cat.fnValues?.([fromJS([1, 2]), fromJS([3, 4])]).getData())
      .toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
        Fraction(4),
      ]
    `);
  });

  it('calculates columns and scalar lengths', () => {
    expect(operators.len.functor?.([t.column(t.number(), 3)])).toMatchObject(
      t.number()
    );

    expect(
      operators.len.functor?.([t.column(t.date('year'), 1)])
    ).toMatchObject(t.number(U('year')));

    expect(operators.len.fnValues?.([fromJS([1, 2, 3])]))
      .toMatchInlineSnapshot(`
        FractionValue {
          "value": Fraction(3),
        }
      `);

    expect(operators.len.fnValues?.([fromJS([])])).toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(0),
      }
    `);

    expect(
      operators.len.fnValues?.([fromJS([new Date(), new Date(), new Date()])])
    ).toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(3),
      }
    `);
  });

  it('retrieves the first element of a list', () => {
    expect(
      operators.first.functor?.([t.column(t.number(U('bananas')), 2)])
    ).toEqual(t.number(U('bananas')));
    expect(operators.first.functor?.([t.column(t.date('day'), 2)])).toEqual(
      t.date('day')
    );

    expect(
      operators.first.fnValues?.([
        fromJS([BigInt(new Date('2020-01-01').getTime())]),
      ])
    ).toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(1577836800000),
      }
    `);

    expect(operators.first.fnValues?.([fromJS([4, 5, 6])]))
      .toMatchInlineSnapshot(`
          FractionValue {
            "value": Fraction(4),
          }
      `);
  });

  it('retrieves the last element of a list', () => {
    expect(operators.last.fnValues?.([fromJS([4, 5, 6])]))
      .toMatchInlineSnapshot(`
          FractionValue {
            "value": Fraction(6),
          }
      `);
  });

  it('countif: counts the true elements in a list', () => {
    expect(
      operators.countif.functor!([t.column(t.boolean(), 3)])
    ).toMatchObject(t.number());

    expect(operators.countif.fnValues?.([fromJS([true, false, true])]))
      .toMatchInlineSnapshot(`
          FractionValue {
            "value": Fraction(2),
          }
      `);
  });

  it('sorts a list', () => {
    expect(
      operators.sort.functor!([t.column(t.number(U('bananas')), 3)])
    ).toMatchObject(t.column(t.number(U('bananas')), 3));

    expect(operators.sort.fnValues?.([fromJS([2, 3, 1])]).getData())
      .toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
    `);
  });

  it('uniques list', () => {
    expect(
      operators.unique.functor!([t.column(t.number(U('bananas')), 3)])
    ).toMatchObject(t.column(t.number(U('bananas')), 'unknown'));

    expect(operators.unique.fnValues?.([fromJS([1, 3, 2, 1, 3, 4])]).getData())
      .toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
        Fraction(4),
      ]
    `);
  });

  it('reverses a list', () => {
    const columnType = t.column(t.number(U('bananas')), 3);
    expect(operators.reverse.functorNoAutomap?.([columnType])).toMatchObject(
      columnType
    );

    expect(
      operators.reverse
        .fnValuesNoAutomap?.([fromJS([1, 2, 3])], [columnType])
        .getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(3),
        Fraction(2),
        Fraction(1),
      ]
    `);
  });

  it('reverses a table', () => {
    const tableValue = Table.fromNamedColumns(
      [fromJS([1, 2, 3]), fromJS([6, 4, 5])],
      ['A', 'B']
    );
    expect(operators.reverse.fnValuesNoAutomap?.([tableValue]).getData())
      .toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(3),
          Fraction(2),
          Fraction(1),
        ],
        Array [
          Fraction(5),
          Fraction(4),
          Fraction(6),
        ],
      ]
    `);
  });
});
