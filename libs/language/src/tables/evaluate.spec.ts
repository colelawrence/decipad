import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  n,
  c,
  l,
  block,
  assign,
  col,
  r,
  tableDef,
  prop,
} from '@decipad/language-utils';
// eslint-disable-next-line no-restricted-imports
import { runAST } from '..';

import { usesRecursion } from './evaluate';

setupDeciNumberSnapshotSerializer();

it('can find a previous symbol', () => {
  expect(usesRecursion(c('previous', l(1)))).toEqual(true);
  expect(usesRecursion(c('Previous', l(1)))).toEqual(false);

  expect(usesRecursion(c('+', l(1), c('previous', l(1))))).toEqual(true);
  expect(usesRecursion(c('+', l(1), l(1)))).toEqual(false);
});

describe('evaluateTableColumn', () => {
  const testEvaluate = async (exp: AST.Expression): Promise<Array<unknown>> => {
    const testBlock = block(
      assign('numbers', col(1, 2, 3, 4)),
      tableDef('Table', {
        numbers: col(1, 2, 3, 4),
        theTestColumn: exp,
      }),
      prop('Table', 'theTestColumn')
    );

    return (await runAST(testBlock, { doNotValidateResults: false }))
      .value as Array<unknown>;
  };

  it('can emulate a quadratic function', async () => {
    expect(await testEvaluate(c('*', l(2), c('previous', l(1)))))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 4n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 8n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 16n,
          "s": 1n,
        },
      ]
    `);
  });

  it('can be used in a column with inherent size', async () => {
    expect(await testEvaluate(c('*', n('ref', 'numbers'), c('previous', l(1)))))
      .toMatchInlineSnapshot(`
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
          "n": 6n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 24n,
          "s": 1n,
        },
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

  it('ensures columns are consistently sized', async () => {
    await expect(async () =>
      runAST(
        block(
          tableDef('Table', {
            oneThing: l(1),
            twoThings: col(1, 2),
          })
        )
      )
    ).rejects.toThrow();
  });
});
