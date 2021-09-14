import { AST } from '..';
import { getContextFromProgram } from '../infer';
import { n, c, l, block, assign, col } from '../utils';
import { evaluate } from './evaluate';

import { Realm } from './Realm';
import { usesRecursion, evaluateTableColumn } from './table';

it('can find a previous symbol', () => {
  expect(usesRecursion(c('previous', l(1)))).toEqual(true);
  expect(usesRecursion(c('Previous', l(1)))).toEqual(false);

  expect(usesRecursion(c('+', l(1), c('previous', l(1))))).toEqual(true);
  expect(usesRecursion(c('+', l(1), l(1)))).toEqual(false);
});

describe('evaluateTableColumn', () => {
  const testEvaluate = async (exp: AST.Expression, rowCount: number) => {
    const program = block(assign('numbers', col(1, 2, 3, 4)), exp);
    const realm = new Realm(await getContextFromProgram([program]));

    // Evaluate first line, to inject "numbers"
    await evaluate(realm, program.args[0]);
    const result = await evaluateTableColumn(
      realm,
      program.args[1] as AST.Expression,
      rowCount
    );

    // Should be cleaned
    expect(realm.previousValue).toEqual(null);

    return result;
  };

  it('can emulate a quadratic function', async () => {
    expect(
      (await testEvaluate(c('*', l(2), c('previous', l(1))), 4)).getData()
    ).toEqual([2, 4, 8, 16]);
  });

  it('can be used in a column with inherent size', async () => {
    expect(
      (
        await testEvaluate(c('*', n('ref', 'numbers'), c('previous', l(1))), 4)
      ).getData()
    ).toEqual([1, 2, 6, 24]);
  });
});
