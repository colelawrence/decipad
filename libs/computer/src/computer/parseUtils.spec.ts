import { expect, it } from 'vitest';
import type { Program } from '@decipad/computer-interfaces';
import { createProgramFromMultipleStatements } from './parseUtils';
import { prettyPrintProgramBlock } from '../testUtils';

it('creates multiple statements for legacy multi-statement usage', () => {
  const prettyPrint = (p: Program) =>
    p.map((block) => prettyPrintProgramBlock(block));

  expect(prettyPrint(createProgramFromMultipleStatements('1\n2')))
    .toMatchInlineSnapshot(`
      [
        "1",
        "2",
      ]
    `);

  expect(prettyPrint(createProgramFromMultipleStatements(' ')))
    .toMatchInlineSnapshot(`
      [
        "(noop)",
      ]
    `);

  expect(prettyPrint(createProgramFromMultipleStatements('syntax --/-- error')))
    .toMatchInlineSnapshot(`
      [
        "Syntax error: Syntax error",
      ]
    `);
});
