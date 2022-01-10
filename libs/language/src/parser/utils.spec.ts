import { assign, block, c, col, l, prop, table } from '../utils';
import { prettyPrintAST } from './utils';

it('can pretty print the AST', () => {
  expect(
    prettyPrintAST(
      block(
        assign('A', c('+', l(1), l(2))),
        col(l(1), l(2)),
        prop('Foo', 'Bar')
      )
    )
  ).toMatchInlineSnapshot(`
    "(block
      (assign
        (def A)
        (+ 1 2))
      (column 1 2)
      (prop (ref Foo).Bar))"
  `);
});

it('can pretty print tables', () => {
  expect(
    prettyPrintAST(
      table({
        Col1: col(1, 2, 3),
        Col2: l(1),
      })
    )
  ).toMatchInlineSnapshot(`
    "(table
      Col1 (column 1 2 3)
      Col2 1)"
  `);
});
