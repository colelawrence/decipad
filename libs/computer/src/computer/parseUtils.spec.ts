import { createProgramFromMultipleStatements } from './parseUtils';
import { Program } from '../types';
import { prettyPrintProgramBlock } from '../testUtils';

it('creates multiple statements for legacy multi-statement usage', () => {
  const prettyPrint = (p: Program) =>
    p.map((block) => prettyPrintProgramBlock(block));

  expect(prettyPrint(createProgramFromMultipleStatements('1\n2')))
    .toMatchInlineSnapshot(`
      Array [
        "1",
        "2",
      ]
    `);

  expect(prettyPrint(createProgramFromMultipleStatements(' ')))
    .toMatchInlineSnapshot(`
      Array [
        "(noop)",
      ]
    `);

  expect(prettyPrint(createProgramFromMultipleStatements('syntax --/-- error')))
    .toMatchInlineSnapshot(`
      Array [
        "Syntax error: Syntax error",
      ]
    `);
});
