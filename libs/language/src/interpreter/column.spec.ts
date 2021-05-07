import { n, c, l } from '../utils';

import { Realm } from './Realm';
import { usesRecursion, evaluateTableColumn } from './column';
import { fromJS } from './Value';

it('can find a previous symbol', () => {
  expect(usesRecursion(c('previous', l(1)))).toEqual(true);
  expect(usesRecursion(c('Previous', l(1)))).toEqual(false);

  expect(usesRecursion(c('+', l(1), c('previous', l(1))))).toEqual(true);
  expect(usesRecursion(c('+', l(1), l(1)))).toEqual(false);
});

describe('evaluateTableColumn', () => {
  it('can emulate a quadratic function', async () => {
    const realm = new Realm();

    expect(
      await evaluateTableColumn(
        realm,
        c('*', l(2), c('previous', l(1))),
        4
      ).getData()
    ).toEqual([2, 4, 8, 16]);

    // Should be cleaned
    expect(realm.previousValue).toEqual(null);
  });

  it('can be used in a column with inherent size', async () => {
    const realm = new Realm();
    realm.stack.set('numbers', fromJS([1, 2, 3, 4]));

    expect(
      await evaluateTableColumn(
        realm,
        c('*', n('ref', 'numbers'), c('previous', l(1))),
        4
      ).getData()
    ).toEqual([1, 2, 6, 24]);

    // Should be cleaned
    expect(realm.previousValue).toEqual(null);
  });
});
