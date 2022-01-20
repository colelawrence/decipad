import { AST, runAST } from '..';
import { n, c, l, block, assign, col, r, tableDef } from '../utils';

import { usesRecursion } from './table';

it('can find a previous symbol', () => {
  expect(usesRecursion(c('previous', l(1)))).toEqual(true);
  expect(usesRecursion(c('Previous', l(1)))).toEqual(false);

  expect(usesRecursion(c('+', l(1), c('previous', l(1))))).toEqual(true);
  expect(usesRecursion(c('+', l(1), l(1)))).toEqual(false);
});

describe('evaluateTableColumn', () => {
  const testEvaluate = async (exp: AST.Expression) => {
    const testBlock = block(
      assign('numbers', col(1, 2, 3, 4)),
      tableDef('Table', {
        numbers: col(1, 2, 3, 4),
        theTestColumn: exp,
      }),
      n('property-access', r('Table'), 'theTestColumn')
    );

    return (await runAST(testBlock)).value as unknown[];
  };

  it('can emulate a quadratic function', async () => {
    expect(await testEvaluate(c('*', l(2), c('previous', l(1)))))
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
    expect(await testEvaluate(c('*', n('ref', 'numbers'), c('previous', l(1)))))
      .toMatchInlineSnapshot(`
        Array [
          Fraction(1),
          Fraction(2),
          Fraction(6),
          Fraction(24),
        ]
      `);
  });

  it('evaluates formulae', async () => {
    const form = await testEvaluate(l(1));

    expect(form.join(', ')).toMatchInlineSnapshot(`"1, 1, 1, 1"`);
  });

  it('lets us access the current row', async () => {
    const form = await testEvaluate(c('+', r('OtherColumn'), l(100)));

    expect(form.join(', ')).toMatchInlineSnapshot(`"101, 101, 101, 101"`);
  });

  it('lets us access the previous item of this column', async () => {
    const form = await testEvaluate(c('+', l(1), c('previous', l(1))));

    expect(form.join(', ')).toMatchInlineSnapshot(`"2, 3, 4, 5"`);
  });
});
