import { getDefined } from '@decipad/utils';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { Value, buildType as t } from '@decipad/language-types';
import { parseFunctor } from '../parseFunctor';
import { reducerOperators as operators } from './reducer-operators';
import { makeContext } from '../utils/testUtils';
import type { FullBuiltinSpec } from '../interfaces';

setupDeciNumberSnapshotSerializer();

const sumif = parseFunctor(
  getDefined((operators.sumif as FullBuiltinSpec).functionSignature)
);

describe('reducer operators', () => {
  it('sum: sums all numbers on a list', async () => {
    expect(
      await (operators.total as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([2, 1.3, 2.75, 0, 3.1, 5])],
        [],
        makeContext()
      )
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
      await (operators.sumif as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([1, 2, 3]), Value.fromJS([true, false, true])],
        [],
        makeContext()
      )
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
