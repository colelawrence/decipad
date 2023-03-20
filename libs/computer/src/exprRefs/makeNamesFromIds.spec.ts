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
    getIdentifiedBlocks(
      'Table1 = {}',
      'Table1.Column1 = 2',
      'exprRef_block_0.exprRef_block_1',
      'Table1.Column1',
      'Table1.exprRef_block_1'
    )
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(assign
      (def Value_1)
      (prop (ref Table1).Column1))",
      "(assign
      (def Value_2)
      (prop (ref Table1).Column1))",
      "(assign
      (def Value_3)
      (prop (ref Table1).Column1))",
    ]
  `);
});

it('supports references to table-column-assign (ID based)', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks('Table1 = {}', 'Table1.Column1 = 2', 'exprRef_block_1')
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(assign
      (def Value_1)
      (prop (ref Table1).Column1))",
    ]
  `);
});

it('supports references to table-column-assign (ID based) in a table column assign', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks(
      'Table1 = {}',
      'Table1.Column1 = 2',
      'Table1.Column3 = exprRef_block_1'
    )
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column3) (ref Column1))",
    ]
  `);
});

it('naming conflicts', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks(
      'Table1 = {}',
      'Table1.Column1 = 2',
      'Table2 = {}',
      'Table2.Column1 = 2',
      'exprRef_block_1',
      'exprRef_block_3'
    )
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(table Table2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column1) 2)",
      "(assign
      (def Value_1)
      (prop (ref Table1).Column1))",
      "(assign
      (def Value_2)
      (prop (ref Table2).Column1))",
    ]
  `);
});

it('naming conflicts (2)', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks(
      'Table1 = {}',
      'Column1 = 2',
      'Table1.Column1 = 2',
      'Table1.Column2 = Column1',
      'Table2 = {}',
      'Table2.Column1 = 2',
      'Table2.Column2 = Column1',
      'Table2.Column3 = Table2.Column1',
      'exprRef_block_2',
      'exprRef_block_5'
    )
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(assign
      (def Column1)
      2)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column2) (ref Column1))",
      "(table Table2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column1) 2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column2) (ref Column1))",
      "(table-column-assign (tablepartialdef Table2) (coldef Column3) (prop (ref Table2).Column1))",
      "(assign
      (def Value_1)
      (prop (ref Table1).Column1))",
      "(assign
      (def Value_2)
      (prop (ref Table2).Column1))",
    ]
  `);
});

it('naming conflicts (in columns)', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks(
      'Table1 = {}',
      'Table1.Year = 1',
      'Table2 = {}',
      'Table2.Year = 2',
      'Table2.Column2 = Table2.Year'
    )
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(table-column-assign (tablepartialdef Table1) (coldef Year) 1)",
      "(table Table2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Year) 2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column2) (prop (ref Table2).Year))",
    ]
  `);
});

it('naming conflicts (using IDs to refer)', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks(
      'Table1 = {}',
      'Column1 = 2',
      'Table1.Column1 = 2',
      'Table1.Column2 = exprRef_block_2',
      'Table2 = {}',
      'Table2.Column1 = 2',
      'Table2.Column2 = Column1',
      'Table2.Column3 = Table1.exprRef_block_2',
      'exprRef_block_2',
      'exprRef_block_5'
    )
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(assign
      (def Column1)
      2)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column2) (ref Column1))",
      "(table Table2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column1) 2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column2) (ref Column1))",
      "(table-column-assign (tablepartialdef Table2) (coldef Column3) (prop (ref Table1).Column1))",
      "(assign
      (def Value_1)
      (prop (ref Table1).Column1))",
      "(assign
      (def Value_2)
      (prop (ref Table2).Column1))",
    ]
  `);
});

it('naming conflicts (using IDs to refer) (2)', () => {
  const [result] = replaceExprRefsWithPrettyRefs(
    getIdentifiedBlocks(
      'Table1 = {}',
      'Column1 = 2',
      'Table1.Column1 = 2',
      'Table1.Column2 = exprRef_block_2',
      'Table2 = {}',
      'Table2.Column1 = 2',
      'Table2.Column2 = Column1',
      'Table2.Column3 = Table1.exprRef_block_2',
      'exprRef_block_2',
      'exprRef_block_5'
    )
  );
  const stringified = result.map(prettyPrintProgramBlock);

  expect(stringified).toMatchInlineSnapshot(`
    Array [
      "(table Table1)",
      "(assign
      (def Column1)
      2)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column1) 2)",
      "(table-column-assign (tablepartialdef Table1) (coldef Column2) (ref Column1))",
      "(table Table2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column1) 2)",
      "(table-column-assign (tablepartialdef Table2) (coldef Column2) (ref Column1))",
      "(table-column-assign (tablepartialdef Table2) (coldef Column3) (prop (ref Table1).Column1))",
      "(assign
      (def Value_1)
      (prop (ref Table1).Column1))",
      "(assign
      (def Value_2)
      (prop (ref Table2).Column1))",
    ]
  `);
});
