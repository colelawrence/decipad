import { expect, it } from 'vitest';
import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { astNode, RuntimeError } from '@decipad/language';
import type { IdentifiedBlock } from '@decipad/computer-interfaces';
import { computeProgram, resultFromError } from './computeProgram';
import {
  deeperProgram,
  programContainingError,
  simplifyInBlockResults,
} from '../testUtils';
import { ComputationRealm } from '../computer/ComputationRealm';
import { Computer } from '../computer';
import { programToComputerProgram } from '../utils/programToComputerProgram';

it('creates a result from an error', () => {
  const realm = new ComputationRealm();
  expect(
    resultFromError(new RuntimeError('Message!'), 'blockid', realm).result.type
  ).toMatchInlineSnapshot(`
    {
      "errorCause": {
        "errType": "free-form",
        "message": "Message!",
      },
      "errorLocation": undefined,
      "kind": "type-error",
    }
  `);

  expect(
    resultFromError(new Error('panic: Message!'), 'blockid', realm).result.type
  ).toMatchInlineSnapshot(`
    {
      "errorCause": {
        "errType": "free-form",
        "message": "Internal Error: Message!. Please contact support",
      },
      "errorLocation": undefined,
      "kind": "type-error",
    }
  `);
});

const testCompute = async (program: AST.Block[]) =>
  simplifyInBlockResults(
    await computeProgram(
      programToComputerProgram(
        program.map(
          (b): IdentifiedBlock => ({
            id: b.id,
            type: 'identified-block',
            block: b,
          })
        )
      ),
      new Computer()
    )
  );

it('infers+evaluates a deep program', async () => {
  expect(await testCompute(deeperProgram)).toMatchInlineSnapshot(`
    [
      "block-0 -> 1",
      "block-1 -> 123",
      "block-2 -> 2",
      "block-3 -> 2",
      "block-4 -> 3",
      "block-5 -> 2",
      "block-6 -> 2",
    ]
  `);
});

it('returns type errors', async () => {
  expect(await testCompute(programContainingError)).toMatchInlineSnapshot(`
    [
      "block-0 -> 1",
      "block-1 -> Error in operation "+" (number, string): The function + cannot be called with (number, string)",
      "block-2 -> 2",
      "block-3 -> Error in operation "+" (number, string): The function + cannot be called with (number, string)",
    ]
  `);
});

it('preserves row count of generator tables', async () => {
  const blocks: Array<AST.Block> = [
    {
      id: 'table',
      type: 'block',
      args: [astNode('table', astNode('tabledef', 'my-table'))],
    },
    {
      id: 'column',
      type: 'block',
      args: [
        astNode(
          'table-column-assign',
          astNode('tablepartialdef', 'my-table'),
          astNode('coldef', 'my-column'),
          astNode(
            'column',
            astNode('column-items', astNode('literal', 'string', 'some-string'))
          ),
          undefined,
          10_000
        ),
      ],
    },
  ];

  const evaluated = await computeProgram(
    programToComputerProgram(
      blocks.map((block) => ({ type: 'identified-block', id: block.id, block }))
    ),
    new Computer()
  );

  expect(evaluated).toMatchInlineSnapshot(`
    [
      {
        "epoch": 0n,
        "id": "table",
        "result": {
          "meta": [Function],
          "type": {
            "columnNames": [
              "my-column",
            ],
            "columnTypes": [
              {
                "kind": "string",
              },
            ],
            "delegatesIndexTo": "my-table",
            "indexName": "my-table",
            "kind": "table",
            "rowCount": 10000,
          },
          "value": [
            [Function],
          ],
        },
        "type": "computer-result",
        "usedNames": [],
        "visibleVariables": {
          "global": Set {
            "exprRef_table",
            "my-table",
            "my-table.my-column",
            "exprRef_column",
          },
          "local": Set {
            "my-column",
          },
        },
      },
      {
        "epoch": 0n,
        "id": "column",
        "result": {
          "meta": [Function],
          "type": {
            "cellCount": 10000,
            "cellType": {
              "kind": "string",
            },
            "indexedBy": "my-table",
            "kind": "column",
          },
          "value": [Function],
        },
        "type": "computer-result",
        "usedNames": [],
        "visibleVariables": {
          "global": Set {
            "exprRef_table",
            "my-table",
            "my-table.my-column",
            "exprRef_column",
          },
          "local": Set {
            "my-column",
          },
        },
      },
    ]
  `);
});
