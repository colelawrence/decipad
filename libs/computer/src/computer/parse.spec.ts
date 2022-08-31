import produce from 'immer';
import { getOnly } from '@decipad/utils';
import { createProgramFromMultipleStatements, updateParse } from './parse';
import { Program, UnparsedBlock } from '../types';
import { prettyPrintAST } from '..';

it('parses only the necessary parts', () => {
  const program: UnparsedBlock[] = [
    {
      id: '0',
      type: 'unparsed-block',
      source: 'A = 1',
    },
  ];
  const firstParse = updateParse(program);
  expect(firstParse).toMatchObject([
    {
      id: '0',
      block: {
        args: [{ type: 'assign' }],
      },
    },
  ]);

  // Will return the exact same object
  const parsedSame = updateParse(program, firstParse);
  expect(parsedSame[0]).toBe(firstParse[0]);

  // Will return a different object
  const changedProgram = produce(program, (p) => {
    p[0].source = 'A = 2';
  });
  const parsedDifferent = updateParse(changedProgram, firstParse);
  expect(parsedDifferent[0]).not.toEqual(firstParse[0]);
});

it('reports syntax errors', () => {
  expect(
    updateParse([
      {
        id: '0',
        type: 'unparsed-block',
        source: 'syntax --/-- error',
      },
    ])
  ).toMatchObject([
    {
      type: 'computer-parse-error',
      id: '0',
    },
  ]);
});

it('creates multiple statements for legacy multi-statement usage', () => {
  const prettyPrint = (p: Program) =>
    p.map((block) => {
      if (block.type === 'unparsed-block') {
        return `unparsed: ${block.source}`;
      }
      const node = getOnly(block.block.args);
      return prettyPrintAST(node);
    });

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
        "unparsed: syntax --/-- error",
      ]
    `);
});
