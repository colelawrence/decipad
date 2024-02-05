import { parseBlock } from '..';
import { prettyPrintAST } from '../utils';

function prettyParse(source: string) {
  const block = parseBlock(source);
  if (block.error != null) {
    throw block.error;
  }

  return prettyPrintAST(block.solution);
}

it('allows spaces between varname assignments', () => {
  expect(prettyParse('a b c = 10')).toMatchInlineSnapshot(`
    "(block
      (assign
        (def a b c)
        10))"
  `);
});

it('correctly identifies identifier and removes surrounding space', () => {
  expect(prettyParse('a b         = 2')).toMatchInlineSnapshot(`
    "(block
      (assign
        (def a b)
        2))"
  `);
});

it('can use them in calculations', () => {
  expect(prettyParse('c = `a b`')).toMatchInlineSnapshot(`
    "(block
      (assign
        (def c)
        (ref a b)))"
  `);
});

it('works for a more complex expression', () => {
  expect(prettyParse('a b c d = `a` * 32 * abc')).toMatchInlineSnapshot(`
    "(block
      (assign
        (def a b c d)
        (* (* (ref a) 32) (ref abc))))"
  `);
});
