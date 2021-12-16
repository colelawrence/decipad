import { build as t } from '../type';
import { c, col, l, n, u, timeQuantity } from '../utils';
import { date } from '../date';
import { getType, getValue } from './as-directive';
import { testGetType, testGetValue } from './testUtils';

const hours = u('hours');
const minute = u('minutes');
const year = u('years');

describe('getType', () => {
  it('adds a unit to a unitless type', async () => {
    expect(
      (await testGetType(getType, l(1), n('units', hours))).toString()
    ).toMatchInlineSnapshot(`"hours"`);
  });

  it('converts a unit to another', async () => {
    expect(
      (await testGetType(getType, l(1, minute), n('units', hours))).toString()
    ).toMatchInlineSnapshot(`"hours"`);
  });

  it('converts unitless column to other unitful column', async () => {
    expect(
      await testGetType(getType, col(l(1), l(2)), n('units', year))
    ).toEqual(t.column(t.number([year]), 2));
  });
});

describe('getValue', () => {
  it('converts number to number', async () => {
    expect(await testGetValue(getValue, l(2.5, hours), n('units', minute)))
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

    expect(await testGetValue(getValue, subtractDates, n('units', year)))
      .toMatchInlineSnapshot(`
        FractionValue {
          "value": Fraction(2),
        }
      `);
  });

  it('with fractions (1)', async () => {
    const quantity = timeQuantity({ day: 1n, hour: 12n });

    expect(await testGetValue(getValue, quantity, n('units', u('days'))))
      .toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(1.5),
      }
    `);
  });

  it('with fractions (2)', async () => {
    const quantity = timeQuantity({ minute: 90n });

    expect(await testGetValue(getValue, quantity, n('units', u('hours'))))
      .toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(1.5),
      }
    `);
  });

  it('works on a unit-less column', async () => {
    const quantity = col(l(1), l(2), l(3));

    expect(
      await (
        await testGetValue(getValue, quantity, n('units', u('watts')))
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
    `);
  });

  it('works on a unitful column', async () => {
    const km = u('meters', { multiplier: 1000 });
    const quantity = col(l(1, km), l(2, km), l(3, km));

    expect(await testGetValue(getValue, quantity, n('units', u('miles'))))
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
