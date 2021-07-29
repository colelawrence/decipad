import { assign, block, c, col, l, prop } from '../utils';
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
      (prop Foo.Bar))"
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
