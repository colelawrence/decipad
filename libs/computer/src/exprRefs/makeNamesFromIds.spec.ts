import { AST, astNode as n } from '@decipad/language';
import type { IdentifiedBlock } from '../types';
import { replaceExprRefsWithPrettyRefs } from './makeNamesFromIds';
import { getIdentifiedBlocks, prettyPrintProgramBlock } from '../testUtils';

const b = (id: string, stat: AST.Statement): IdentifiedBlock => ({
  type: 'identified-block',
  id,
  block: n('block', stat),
});

const assignVar1 = b('1', n('assign', n('def', 'Var1'), n('noop')));
const stat2 = b('2', n('ref', 'exprRef_3'));
const stat3 = b(
  '3',
  n(
    'function-call',
    n('funcref', '+'),
    n('argument-list', n('ref', 'exprRef_1'), n('ref', 'exprRef_2'))
  )
);

const assignVarMessy = b('1', n('assign', n('def', '@ +'), n('noop')));
const useVarMessy = b('2', n('ref', 'exprRef_1'));

it('creates names for the computer to use', () => {
  const [result, renames] = replaceExprRefsWithPrettyRefs([
    assignVar1,
    stat2,
    stat3,
  ]);
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified[0]).toMatchInlineSnapshot(`
    "(assign
      (def Var1)
      (noop))"
  `);
  expect(stringified[1]).toMatchInlineSnapshot(`
    "(assign
      (def Value_1)
      (ref Value_2))"
  `);
  expect(stringified[2]).toMatchInlineSnapshot(`
    "(assign
      (def Value_2)
      (+ (ref Var1) (ref Value_1)))"
  `);

  expect(renames).toMatchInlineSnapshot(`
    Set {
      "Value_1",
      "Value_2",
    }
  `);
});

it('creates names for the computer to use (2)', () => {
  const [result] = replaceExprRefsWithPrettyRefs([assignVar1, assignVar1]);
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified[0]).toMatchInlineSnapshot(`
    "(assign
      (def Var1)
      (noop))"
  `);

  expect(stringified[1]).toMatchInlineSnapshot(`
    "(assign
      (def Var1)
      (noop))"
  `);
});

it('allows messy names', () => {
  const [result] = replaceExprRefsWithPrettyRefs([assignVarMessy, useVarMessy]);
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified[0]).toMatchInlineSnapshot(`
    "(assign
      (def @ +)
      (noop))"
  `);
  expect(stringified[1]).toMatchInlineSnapshot(`
    "(assign
      (def Value_1)
      (ref @ +))"
  `);
});

it('creates names for the computer to use (3)', () => {
  const [result] = replaceExprRefsWithPrettyRefs([stat2, stat2]);
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified[0]).toMatchInlineSnapshot(`
    "(assign
      (def Value_1)
      (ref Value_2))"
  `);

  expect(stringified[1]).toMatchInlineSnapshot(`
    "(assign
      (def Value_1)
      (ref Value_2))"
  `);
});

it('tolerates empty var names', () => {
  const emptyVarBlock = b('1', n('assign', n('def', ''), n('noop')));
  const [result] = replaceExprRefsWithPrettyRefs([emptyVarBlock]);
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified[0]).toMatchInlineSnapshot(`
    "(assign
      (def Value_1)
      (noop))"
  `);
});

it('regression: exprRefs with names, do not go in the generatedNames set', () => {
  const [, generatedNames] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks('one = 1', 'exprRef_block_0')
  );

  expect(generatedNames.has('one')).toBe(false);
});

it('supports references to table-column-assign', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks('Table1.Column1 = 2', 'exprRef_block_0')
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(assign
      (def Value_1)
      (prop (ref Table1).Column1))",
    ]
  `);
});
