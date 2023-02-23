import { parseStatementOrThrow } from '../..';

it('parses of directive', () => {
  expect(parseStatementOrThrow('grams of butter')).toMatchInlineSnapshot(
    `(directive of (ref grams) (generic-identifier butter))`
  );
});
