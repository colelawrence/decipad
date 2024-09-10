import { expect, it } from 'vitest';
import { ProgramBlock } from '@decipad/computer-interfaces';
import {
  Computer,
  astNode,
  buildType,
  deserializeType,
  materializeResult,
  serializeType,
} from '.';
import { Result } from '@decipad/language-interfaces';
import { N } from '@decipad/number';
import { getDefined, timeout } from '@decipad/utils';

function getProgram(
  tableId: string,
  tableName: string,
  columnId: string,
  columnName: string
): [Map<string, ProgramBlock[]>, Map<string, Result.Result>] {
  const programBlocks: Map<string, ProgramBlock[]> = new Map();

  programBlocks.set(tableId, [
    {
      type: 'identified-block',
      id: tableId,
      block: {
        id: tableId,
        type: 'block',
        args: [astNode('table', astNode('tabledef', tableName))],
      },
      isArtificial: true,
      definesVariable: tableName,
    },
  ]);

  const externalColumnId = `${columnId}-external`;

  programBlocks.set(columnId, [
    {
      type: 'identified-block',
      id: columnId,
      block: {
        id: columnId,
        type: 'block',
        args: [
          astNode(
            'table-column-assign',
            astNode('tablepartialdef', tableName),
            astNode('coldef', columnName),
            astNode('externalref', externalColumnId)
          ),
        ],
      },
      definesTableColumn: [tableName, columnName],
      isArtificial: true,
      artificiallyDerivedFrom: [tableId],
    },
  ]);

  const externalDatas = new Map<string, Result.Result>();
  externalDatas.set(externalColumnId, {
    type: serializeType(buildType.column(deserializeType({ kind: 'number' }))),
    value: [N(5)],
    meta: undefined,
  });

  return [programBlocks, externalDatas];
}

it('pushes two external datas and removes the last one', async () => {
  const computer = new Computer();

  const [programBlocks, externalDatas] = getProgram(
    'table-1-id',
    'table-1-name',
    'column-1-id',
    'column-1-name'
  );

  await computer.pushComputeDelta({
    extra: { upsert: programBlocks },
    external: { upsert: externalDatas },
  });

  expect(computer.getLatestProgram().length).toMatchInlineSnapshot(`2`);

  await timeout(1000);

  expect(
    await materializeResult(
      getDefined(await computer.getBlockIdResult('table-1-id')?.result)
    )
  ).toMatchInlineSnapshot(`
    {
      "meta": [Function],
      "type": {
        "columnNames": [
          "column-1-name",
        ],
        "columnTypes": [
          {
            "kind": "number",
            "unit": null,
          },
        ],
        "delegatesIndexTo": "exprRef_table_1_id",
        "indexName": "exprRef_table_1_id",
        "kind": "table",
        "rowCount": undefined,
      },
      "value": [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
        ],
      ],
    }
  `);

  const [newProgramBlocks, newExternalDatas] = getProgram(
    'table-2-id',
    'table-2-name',
    'column-2-id',
    'column-2-name'
  );

  await computer.pushComputeDelta({
    extra: { upsert: newProgramBlocks },
    external: { upsert: newExternalDatas },
  });

  expect(computer.getLatestProgram().length).toMatchInlineSnapshot(`4`);

  await timeout(1000);

  expect(
    await materializeResult(
      getDefined(await computer.getBlockIdResult('table-1-id')?.result)
    )
  ).toMatchInlineSnapshot(`
    {
      "meta": [Function],
      "type": {
        "columnNames": [
          "column-1-name",
        ],
        "columnTypes": [
          {
            "kind": "number",
            "unit": null,
          },
        ],
        "delegatesIndexTo": "exprRef_table_1_id",
        "indexName": "exprRef_table_1_id",
        "kind": "table",
        "rowCount": undefined,
      },
      "value": [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
        ],
      ],
    }
  `);

  await computer.pushComputeDelta({
    extra: { remove: ['table-2-id', 'column-2-id'] },
    external: { remove: ['column-2-id-external'] },
  });

  await timeout(1000);
  expect(computer.getLatestProgram().length).toMatchInlineSnapshot(`2`);

  expect(
    await materializeResult(
      getDefined(await computer.getBlockIdResult('table-1-id')?.result)
    )
  ).toMatchInlineSnapshot(`
    {
      "meta": [Function],
      "type": {
        "columnNames": [
          "column-1-name",
        ],
        "columnTypes": [
          {
            "kind": "number",
            "unit": null,
          },
        ],
        "delegatesIndexTo": "exprRef_table_1_id",
        "indexName": "exprRef_table_1_id",
        "kind": "table",
        "rowCount": undefined,
      },
      "value": [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
        ],
      ],
    }
  `);
});
