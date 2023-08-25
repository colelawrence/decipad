import { getDefined } from '@decipad/utils';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { fromJS } from '../../value';
import { buildType as t } from '../../type';
import { parseFunctor } from '../parseFunctor';
import { reducerOperators as operators } from './reducer-operators';

setupDeciNumberSnapshotSerializer();

const sumif = parseFunctor(getDefined(operators.sumif.functionSignature));

describe('reducer operators', () => {
  it('sum: sums all numbers on a list', async () => {
    expect(
      await operators.total.fnValues?.([fromJS([2, 1.3, 2.75, 0, 3.1, 5])])
    ).toMatchInlineSnapshot(`
      NumberValue {
        "value": DeciNumber {
          "d": 20n,
          "infinite": false,
          "n": 283n,
          "s": 1n,
        },
      }
    `);
  });

  it('sumif: sums the elements against boolean elements in a second list', async () => {
    expect(
      await sumif([t.column(t.number()), t.column(t.boolean())])
    ).toMatchObject(t.number());

    expect(
      await operators.sumif.fnValues?.([
        fromJS([1, 2, 3]),
        fromJS([true, false, true]),
      ])
    ).toMatchInlineSnapshot(`
      NumberValue {
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 4n,
          "s": 1n,
        },
      }
    `);
  });
});
