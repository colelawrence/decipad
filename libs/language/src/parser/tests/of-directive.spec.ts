import { parseStatementOrThrow, prettyPrintAST } from '../..';

it('parses simple of directive', () => {
  expect(
    prettyPrintAST(parseStatementOrThrow('grams of butter'))
  ).toMatchInlineSnapshot(
    `"(directive of (ref grams) (generic-identifier butter))"`
  );
});

it('parses more complex of directive', () => {
  expect(
    prettyPrintAST(
      parseStatementOrThrow('2 grams of medicine / kg of bodyweight')
    )
  ).toMatchInlineSnapshot(
    `"(/ (implicit* 2 (directive of (ref grams) (generic-identifier medicine))) (directive of (ref kg) (generic-identifier bodyweight)))"`
  );
});
