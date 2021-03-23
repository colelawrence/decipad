import { expandExpression, expandStatement, expandProgram } from './expansion';
import { c, n, l, funcDef } from '../utils';
import { blocks } from './testFixtures';

it('expands expressions', () => {
  expect(expandExpression(blocks, n('ref', 'a'))).toEqual(l(3));

  expect(
    expandExpression(blocks, c('+', n('ref', 'a'), n('ref', 'a')))
  ).toEqual(c('+', l(3), l(3)));

  expect(expandExpression(blocks, c('func', l(1.1)))).toEqual(
    c('+', l(1.1), l(1))
  );
});

it('expands statements', () => {
  expect(
    expandStatement(blocks, n('assign', n('def', 'New'), n('ref', 'a')))
  ).toEqual(n('assign', n('def', 'New'), l(3)));
  expect(
    expandStatement(blocks, funcDef('Func', ['Arg'], c('+', l(1), l(1))))
  ).toEqual(null);
});

it('expands the program', () => {
  const expanded = expandProgram(blocks);

  expect(expanded[0]).toEqual(blocks[0]); // Assignment of literal is untouched
  expect(expanded[1].args).toEqual([
    n('assign', n('def', 'a'), l(3)), // Another untouched assignment of literal
    l(1), // Reference to B
    // Funcdef was eliminated
  ]);
});
