import { getDefined } from '@decipad/utils';
import { n } from '.';
import { assign, block, c, col, l, prop, table, units } from '../utils';
import { prettyPrintAST, prettyPrintSolutions } from './utils';

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

const meters = {
  exp: 1,
  known: true,
  multiplier: 1,
  unit: 'meters',
};
it('can pretty print units', () => {
  expect(
    prettyPrintAST(n('as', l(10, meters), getDefined(units(meters))))
  ).toMatchInlineSnapshot(`"(as 10meters meters)"`);
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

it('can print multiple parsed solutions', () => {
  expect(prettyPrintSolutions([l(1), l(2)])).toMatchInlineSnapshot(`
    "Result:
    1
    -------
    Result:
    2
    -------
    "
  `);
});
