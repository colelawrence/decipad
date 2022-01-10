import { build as t } from '../type';
import { c, col, l, U, u, ne, r, F } from '../utils';
import { date } from '../date';
import { getType, getValue } from './as-directive';
import { testGetType, testGetValue } from './testUtils';
import { makeContext } from '../infer';
import * as expand from './expand';

const year = u('years');

describe('getType', () => {
  it('adds a unit to a unitless type', async () => {
    expect(
      (await testGetType(getType, l(1), ne(1, 'hours'))).toString()
    ).toMatchInlineSnapshot(`"hours"`);
  });

  it('converts a unit to another', async () => {
    expect(
      (await testGetType(getType, ne(1, 'minute'), ne(1, 'hours'))).toString()
    ).toMatchInlineSnapshot(`"hours"`);
  });

  it('converts unitless column to other unitful column', async () => {
    expect(await testGetType(getType, col(l(1), l(2)), ne(1, 'years'))).toEqual(
      t.column(t.number([year]), 2)
    );
  });

  it('assigns the ref name as the target unit', async () => {
    const ctx = makeContext();
    ctx.stack.set(
      'nuno',
      t.number(U('g', { known: true, multiplier: F(1000) }))
    );
    const quantity = ne(2, 'ton');
    const ref = r('nuno');
    expect(await expand.getType(ctx, getType, [quantity, ref])).toMatchObject(
      t.number(
        U(
          u('nuno', { known: false, aliasFor: U('g', { multiplier: F(1000) }) })
        )
      )
    );
  });
});

describe('getValue', () => {
  it('converts number to number', async () => {
    expect(await testGetValue(getValue, ne(2.5, 'hours'), ne(1, 'minutes')))
      .toMatchInlineSnapshot(`
        FractionValue {
          "value": Fraction(150),
        }
      `);
  });

  it('converts time quantity to number', async () => {
    const subtractDates = c(
      '-',
      date('2022-01', 'month'),
      date('2020-01', 'month')
    );

    expect(await testGetValue(getValue, subtractDates, ne(1, 'year')))
      .toMatchInlineSnapshot(`
        FractionValue {
          "value": Fraction(2),
        }
      `);
  });

  it('works on a unit-less column', async () => {
    const quantity = col(l(1), l(2), l(3));

    expect(
      await (await testGetValue(getValue, quantity, ne(1, 'watts'))).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
    `);
  });

  it('works on a unitful column', async () => {
    const quantity = col(ne(1, 'km'), ne(2, 'km'), ne(3, 'km'));

    expect(await testGetValue(getValue, quantity, ne(1, 'miles')))
      .toMatchInlineSnapshot(`
      Column {
        "_values": Array [
          FractionValue {
            "value": Fraction(0.6(213711922373339696174341843633182215859381)),
          },
          FractionValue {
            "value": Fraction(1.(242742384474667939234868368726636443171876)),
          },
          FractionValue {
            "value": Fraction(1.8(641135767120019088523025530899546647578143)),
          },
        ],
        "valueNames": null,
      }
    `);
  });
});
