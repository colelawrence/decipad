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
    const quantity = timeQuantity({ day: 1, hour: 12 });

    expect(await testGetValue(getValue, quantity, n('units', u('days'))))
      .toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(1.5),
      }
    `);
  });

  it('with fractions (2)', async () => {
    const quantity = timeQuantity({ minute: 90 });

    expect(await testGetValue(getValue, quantity, n('units', u('hours'))))
      .toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(1.5),
      }
    `);
  });

  it('works on a unit-less column', async () => {
    const quantity = col(l(1), l(2), l(3));

    expect(await testGetValue(getValue, quantity, n('units', u('watts'))))
      .toMatchInlineSnapshot(`
      Column {
        "valueNames": null,
        "values": Array [
          FractionValue {
            "value": Fraction(1),
          },
          FractionValue {
            "value": Fraction(2),
          },
          FractionValue {
            "value": Fraction(3),
          },
        ],
      }
    `);
  });

  it('works on a unitful column', async () => {
    const km = u('meters', { multiplier: 1000 });
    const quantity = col(l(1, km), l(2, km), l(3, km));

    expect(await testGetValue(getValue, quantity, n('units', u('miles'))))
      .toMatchInlineSnapshot(`
      Column {
        "valueNames": null,
        "values": Array [
          FractionValue {
            "value": Fraction(0.(621504039776258545680546923555003107520198881292728402734617775015537600994406463642013673088875077688004972032318210068365444375388440024860161591050341827221876942200124300807955251709136109384711000)),
          },
          FractionValue {
            "value": Fraction(1.(243008079552517091361093847110006215040397762585456805469235550031075201988812927284027346177750155376009944064636420136730888750776880049720323182100683654443753884400248601615910503418272218769422001)),
          },
          FractionValue {
            "value": Fraction(1.(864512119328775637041640770665009322560596643878185208203853325046612802983219390926041019266625233064014916096954630205096333126165320074580484773151025481665630826600372902423865755127408328154133001)),
          },
        ],
      }
    `);
  });
});
