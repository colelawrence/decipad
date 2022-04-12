import { l, genericIdent, ne } from '../utils';
import { getType, getValue } from './of-directive';
import { testGetType, testGetValue } from './testUtils';

describe('getType', () => {
  it('cannot set unit quality on unitless number', async () => {
    expect(
      (await testGetType(getType, l(1), genericIdent('flour'))).errorCause
    ).toMatchObject({ spec: { errType: 'need-one-only-one-unit' } });
  });

  it('sets unit quality on unitful number', async () => {
    expect(
      (
        await testGetType(getType, ne(1, 'kilograms'), genericIdent('flour'))
      ).toString()
    ).toMatchInlineSnapshot(`"kilograms of flour"`);
  });
});

describe('getValue', () => {
  it('returns left side value', async () => {
    expect(await testGetValue(getValue, l(1), genericIdent('flour')))
      .toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(1),
      }
    `);
  });
});
