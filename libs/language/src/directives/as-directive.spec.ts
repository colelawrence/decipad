import { N } from '@decipad/number';
import { build as t } from '../type';
import { c, col, l, U, u, ne, r, n } from '../utils';
import { date } from '../date';
import { getType, getValue } from './as-directive';
import { testGetType, testGetValue } from './testUtils';
import { makeContext } from '../infer';

const year = u('years');

describe('getType', () => {
  it('adds a unit to a unitless type', async () => {
    expect(await testGetType(getType, l(1), ne(1, 'hours'))).toMatchObject({
      type: 'number',
      unit: U('hours'),
    });
  });

  it('converts to percentage', async () => {
    expect(
      await testGetType(getType, l(1), n('generic-identifier', '%'))
    ).toMatchObject({
      type: 'number',
      unit: null,
      numberFormat: 'percentage',
    });
  });

  it('converts a unit to another', async () => {
    expect(
      await testGetType(getType, ne(1, 'minute'), ne(1, 'hours'))
    ).toMatchObject({
      type: 'number',
      unit: U('hours'),
    });
  });

  it('converts unitless column to other unitful column', async () => {
    expect(
      await testGetType(getType, col(l(1), l(2)), ne(1, 'years'))
    ).toMatchObject(t.column(t.number([year]), 2));
  });

  it('assigns the ref name as the target unit', async () => {
    const ctx = makeContext();
    ctx.stack.set(
      'nuno',
      t.number(U('g', { known: true, multiplier: N(1000) }))
    );
    const quantity = ne(2, 'ton');
    const ref = r('nuno');
    expect(await testGetType(getType, ctx, quantity, ref)).toMatchObject(
      t.number(
        U(
          u('nuno', { known: false, aliasFor: U('g', { multiplier: N(1000) }) })
        )
      )
    );
  });

  it('converts time imprecisely', async () => {
    expect(
      await testGetType(getType, ne(1, 'month'), ne(1, 'days'))
    ).toMatchObject(t.number(U('days'), undefined, 'month-day-conversion'));
  });
});

describe('getValue', () => {
  it('converts number to number', async () => {
    expect(await testGetValue(getValue, ne(2.5, 'hours'), ne(1, 'minutes')))
      .toMatchInlineSnapshot(`
      NumberValue {
        "value": DeciNumber(150),
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
      NumberValue {
        "value": DeciNumber(2),
      }
    `);
  });

  it('works on a unit-less column', async () => {
    const quantity = col(l(1), l(2), l(3));

    expect(
      await (await testGetValue(getValue, quantity, ne(1, 'watts'))).getData()
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('converts to percent', async () => {
    const quantity = col(
      c('implicit*', n('literal', 'number', N(1, 10)), r('kilometer'))
    );

    expect(
      await testGetType(getType, quantity, n('generic-identifier', '%'))
    ).toMatchObject({
      type: 'number',
      unit: null,
      numberFormat: 'percentage',
    });

    expect(
      (
        await testGetValue(getValue, quantity, n('generic-identifier', '%'))
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber(0.1),
      ]
    `);
    expect(
      (
        await testGetValue(getValue, l(10), n('generic-identifier', '%'))
      ).getData()
    ).toMatchInlineSnapshot(`DeciNumber(10)`);
  });

  it('works on a unitful column', async () => {
    const quantity = col(ne(1, 'kmeter'), ne(2, 'kmeter'), ne(3, 'kmeter'));

    expect((await testGetValue(getValue, quantity, ne(1, 'miles'))).getData())
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(0.6(213711922373339696174341843633182215859381)),
        DeciNumber(1.(242742384474667939234868368726636443171876)),
        DeciNumber(1.8(641135767120019088523025530899546647578143)),
      ]
    `);
  });

  it('converts imprecisely', async () => {
    expect(
      (await testGetValue(getValue, ne(30, 'days'), ne(1, 'months'))).getData()
    ).toMatchInlineSnapshot(`DeciNumber(1)`);
  });
});
