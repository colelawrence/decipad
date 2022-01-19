import { AST, Column } from '..';
import { inferProgram } from '../infer';
import { objectToMap } from '../testUtils';
import { n, c, l, block, assign, col, r } from '../utils';
import { evaluate } from './evaluate';

import { Realm } from './Realm';
import {
  usesRecursion,
  evaluateTableColumn,
  evaluateTableFormula,
} from './table';
import { fromJS } from './Value';

it('can find a previous symbol', () => {
  expect(usesRecursion(c('previous', l(1)))).toEqual(true);
  expect(usesRecursion(c('Previous', l(1)))).toEqual(false);

  expect(usesRecursion(c('+', l(1), c('previous', l(1))))).toEqual(true);
  expect(usesRecursion(c('+', l(1), l(1)))).toEqual(false);
});

describe('evaluateTableColumn', () => {
  const testEvaluate = async (exp: AST.Expression, rowCount: number) => {
    const testBlock = block(assign('numbers', col(1, 2, 3, 4)), exp);
    const realm = new Realm(await inferProgram([testBlock]));

    // Evaluate first line, to inject "numbers"
    await evaluate(realm, testBlock.args[0]);
    const result = await evaluateTableColumn(
      realm,
      testBlock.args[1] as AST.Expression,
      rowCount
    );

    // Should be cleaned
    expect(realm.previousValue).toEqual(null);

    return result;
  };

  it('can emulate a quadratic function', async () => {
    expect((await testEvaluate(c('*', l(2), c('previous', l(1))), 4)).getData())
      .toMatchInlineSnapshot(`
        Array [
          Fraction(2),
          Fraction(4),
          Fraction(8),
          Fraction(16),
        ]
      `);
  });

  it('can be used in a column with inherent size', async () => {
    expect(
      (
        await testEvaluate(c('*', n('ref', 'numbers'), c('previous', l(1))), 4)
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(6),
        Fraction(24),
      ]
    `);
  });
});

describe('evaluateTableFormula', () => {
  const testEvaluate = async (exp: AST.Expression, rowCount: number) => {
    const testBlock = block(assign('numbers', col(1, 2, 3, 4)), exp);
    const realm = new Realm(await inferProgram([testBlock]));

    // Evaluate first line, to inject "numbers"
    await evaluate(realm, testBlock.args[0]);

    const result = await evaluateTableFormula(
      realm,
      objectToMap({ OtherColumn: fromJS([1, 2, 3]) as Column }),
      n(
        'table-formula',
        n('coldef', 'Formula'),
        n('def', 'currentRow'),
        block(testBlock.args[1] as AST.Expression)
      ),
      rowCount
    );

    // Should be cleaned
    expect(realm.previousValue).toEqual(null);

    return result;
  };

  it('evaluates formulae', async () => {
    const form = await testEvaluate(l(1), 2);

    expect(form.getData().join(', ')).toMatchInlineSnapshot(`"1, 1"`);
  });

  it('lets us access the current row', async () => {
    const form = await testEvaluate(
      c('+', n('property-access', r('currentRow'), 'OtherColumn'), l(100)),
      3
    );

    expect(form.getData().join(', ')).toMatchInlineSnapshot(`"101, 102, 103"`);
  });

  it('lets us access the previous item of this column', async () => {
    const form = await testEvaluate(c('+', l(1), c('previous', l(1))), 3);

    expect(form.getData().join(', ')).toMatchInlineSnapshot(`"2, 3, 4"`);
  });
});
