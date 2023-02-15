import { prettyPrintAST } from './utils';
import { AST } from '..';
import { decilang } from './decilang-tag';

it('creates ASTs with interpolations', () => {
  const myOne: AST.Node = decilang`1`;

  expect(prettyPrintAST(decilang`${myOne} + 2`)).toMatchInlineSnapshot(
    `"(+ 1 2)"`
  );
});

it('creates ASTs with name interpolations, using the correct identifier type', () => {
  expect(
    prettyPrintAST(
      decilang`Table.${{ name: 'ColDef' }} = ${{ name: 'Ref' }} over ${{
        name: 'GenericIdentifier',
      }}`
    )
  ).toMatchInlineSnapshot(
    `"(table-column-assign (tablepartialdef Table) (coldef ColDef) (directive over (ref Ref) (generic-identifier GenericIdentifier)))"`
  );
});

it('works with column names as well', () => {
  expect(
    prettyPrintAST(decilang`Table.${{ name: 'ColName' }}`)
  ).toMatchInlineSnapshot(`"(prop (ref Table).ColName)"`);
});
