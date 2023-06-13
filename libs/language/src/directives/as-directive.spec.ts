import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { buildType as t } from '../type';
import { c, col, l, U, u, ne, r, n } from '../utils';
import { date } from '../date';
import { getType, getValue } from './as-directive';
import { testGetType, testGetValue } from './testUtils';
import { makeContext } from '../infer';

setupDeciNumberSnapshotSerializer();

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
    ).toMatchObject(t.column(t.number([year])));
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
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 150n,
          "s": 1n,
        },
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
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
      }
    `);
  });

  it('works on a unit-less column', async () => {
    const quantity = col(l(1), l(2), l(3));

    expect(
      await (await testGetValue(getValue, quantity, ne(1, 'watts'))).getData()
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
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
      await (
        await testGetValue(getValue, quantity, n('generic-identifier', '%'))
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 10n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
      ]
    `);
    expect(
      await (
        await testGetValue(getValue, l(10), n('generic-identifier', '%'))
      ).getData()
    ).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      }
    `);
  });

  it('works on a unitful column', async () => {
    const quantity = col(ne(1, 'kmeter'), ne(2, 'kmeter'), ne(3, 'kmeter'));

    expect(
      await (await testGetValue(getValue, quantity, ne(1, 'miles'))).getData()
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 25146n,
          "infinite": false,
          "n": 15625n,
          "s": 1n,
        },
        DeciNumber {
          "d": 12573n,
          "infinite": false,
          "n": 15625n,
          "s": 1n,
        },
        DeciNumber {
          "d": 8382n,
          "infinite": false,
          "n": 15625n,
          "s": 1n,
        },
      ]
    `);
  });

  it('converts imprecisely', async () => {
    expect(
      await (
        await testGetValue(getValue, ne(30, 'days'), ne(1, 'months'))
      ).getData()
    ).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      }
    `);
  });
});
