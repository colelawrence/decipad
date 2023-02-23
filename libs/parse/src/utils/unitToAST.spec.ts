import { AST, prettyPrintAST } from '@decipad/computer';
import { N } from '@decipad/number';
import { unitToAST } from './unitToAST';

it('turns a unit into an AST', () => {
  expect(
    prettyPrintAST(
      unitToAST([
        {
          unit: 'meter',
          exp: N(1),
          multiplier: N(1000),
          known: true,
        },
      ]) as AST.Expression
    )
  ).toMatchInlineSnapshot(`"(ref kmeter)"`);

  expect(
    prettyPrintAST(
      unitToAST([
        {
          unit: 'meter',
          exp: N(2),
          multiplier: N(1),
          known: true,
        },
      ]) as AST.Expression
    )
  ).toMatchInlineSnapshot(`"(^ (ref meter) 2)"`);

  expect(
    prettyPrintAST(
      unitToAST([
        {
          unit: 'meter',
          exp: N(1),
          multiplier: N(1),
          known: true,
        },
        {
          unit: 'second',
          exp: N(-1),
          multiplier: N(1),
          known: true,
        },
      ]) as AST.Expression
    )
  ).toMatchInlineSnapshot(`"(* (ref meter) (^ (ref second) -1))"`);

  expect(
    prettyPrintAST(
      unitToAST([
        {
          unit: 'meter',
          exp: N(2),
          multiplier: N(1),
          known: true,
        },
        {
          unit: 'second',
          exp: N(-1),
          multiplier: N(1),
          known: true,
        },
      ]) as AST.Expression
    )
  ).toMatchInlineSnapshot(`"(* (^ (ref meter) 2) (^ (ref second) -1))"`);
});
