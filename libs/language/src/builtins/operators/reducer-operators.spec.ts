import { getDefined } from '@decipad/utils';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { fromJS } from '../../value';
import { buildType as t } from '../../type';
import { parseFunctor } from '../parseFunctor';
import { reducerOperators as operators } from './reducer-operators';

setupDeciNumberSnapshotSerializer();

const sumif = parseFunctor(getDefined(operators.sumif.functionSignature));

describe('reducer operators', () => {
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
