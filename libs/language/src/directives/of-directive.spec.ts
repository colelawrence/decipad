import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { l, genericIdent, ne, U, u } from '../utils';
import { getType, getValue } from './of-directive';
import { testGetType, testGetValue } from './testUtils';

setupDeciNumberSnapshotSerializer();

describe('getType', () => {
  it('cannot set unit quality on unitless number', async () => {
    expect(
      (await testGetType(getType, l(1), genericIdent('flour'))).errorCause
    ).toMatchObject({ spec: { errType: 'need-one-only-one-unit' } });
  });

  it('sets unit quality on unitful number', async () => {
    expect(
      await testGetType(getType, ne(1, 'kilograms'), genericIdent('flour'))
    ).toMatchObject({
      type: 'number',
      unit: U([u('grams', { quality: 'flour', multiplier: N(1000) })]),
    });
  });
});

describe('getValue', () => {
  it('returns left side value', async () => {
    expect(await testGetValue(getValue, [l(1), genericIdent('flour')]))
      .toMatchInlineSnapshot(`
      NumberValue {
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
      }
    `);
  });
});
