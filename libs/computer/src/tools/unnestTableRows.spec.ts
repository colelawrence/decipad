import { Result } from '@decipad/language';
import { getDefined, timeout } from '@decipad/utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AsciiTable from 'ascii-table';
import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { all } from '@decipad/generator-utils';
import { Computer } from '../computer/Computer';
import { getIdentifiedBlocks } from '../testUtils';
import { unnestTableRows } from './unnestTableRows';

setupDeciNumberSnapshotSerializer();

it('unnests table rows', async () => {
  const explanation = [
    {
      indexedBy: 'Table',
      labels: ['label1', 'label2'],
      dimensionLength: 1,
    },
  ];
  const result = {
    type: {
      kind: 'materialized-column',
      indexedBy: 'Table',
      cellType: {
        kind: 'number',
      },
    },
    value: [N(1), N(2)],
  } as Result.Result<'materialized-column'>;

  expect([...(await all(unnestTableRows(explanation, result)))])
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "labelInfo": Array [
          Object {
            "indexAtThisDimension": 0,
            "indexName": "Table",
            "indexesOfRemainingLengthsAreZero": true,
            "label": "label1",
            "lengthAtThisDimension": 1,
            "productOfRemainingLengths": 1,
          },
        ],
        "result": Object {
          "type": Object {
            "kind": "number",
            "unit": null,
          },
          "value": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        },
      },
      Object {
        "labelInfo": Array [
          Object {
            "indexAtThisDimension": 1,
            "indexName": "Table",
            "indexesOfRemainingLengthsAreZero": true,
            "label": "label2",
            "lengthAtThisDimension": 1,
            "productOfRemainingLengths": 1,
          },
        ],
        "result": Object {
          "type": Object {
            "kind": "number",
            "unit": null,
          },
          "value": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        },
      },
    ]
  `);
});

describe('can provide information for rendering matrices', () => {
  let computer: Computer;
  beforeEach(async () => {
    computer = new Computer({
      initialProgram: getIdentifiedBlocks(
        `Table = { Xs = [10, 20, 30] }`,
        `Matrix = [100, 200] * Table.Xs`
      ),
    });
    await timeout(0);
  });

  it('can retrieve labels', async () => {
    expect(
      await computer.explainDimensions$.get(
        computer.getBlockIdResult$.get('block-1')
          ?.result as Result.Result<'materialized-column'>
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "dimensionLength": 2,
          "indexedBy": undefined,
          "labels": undefined,
        },
        Object {
          "dimensionLength": 3,
          "indexedBy": "Table",
          "labels": Array [
            "10",
            "20",
            "30",
          ],
        },
      ]
    `);
  });

  it('can turn nested matrices to a tabular data format', async () => {
    const result = getDefined(
      computer.getBlockIdResult$.get('block-1')?.result
    ) as Result.Result<'materialized-column'>;
    const dimExplanation = getDefined(
      await computer.explainDimensions$.get(result)
    );

    const aTable = new AsciiTable('Matrix');

    aTable.setHeading(
      ...dimExplanation.map((v) => v.indexedBy ?? '(no dimension)')
    );

    for await (const {
      labelInfo,
      result: { value },
    } of unnestTableRows(dimExplanation, result)) {
      aTable.addRow(
        ...labelInfo.map((label) => label.label ?? label.indexAtThisDimension),
        value
      );
    }

    expect(aTable.toString()).toMatchInlineSnapshot(`
      ".-------------------------------.
      |            Matrix             |
      |-------------------------------|
      | (no dimension) | Table |      |
      |----------------|-------|------|
      |              0 | 10    | 1000 |
      |              0 | 20    | 2000 |
      |              0 | 30    | 3000 |
      |              1 | 10    | 2000 |
      |              1 | 20    | 4000 |
      |              1 | 30    | 6000 |
      '-------------------------------'"
    `);
  });
});

it('can provide dimension information for rendering product of 2 tables', async () => {
  const computer = new Computer({
    initialProgram: getIdentifiedBlocks(
      `Table1 = {
            Label1 = ["a", "b", "c"]
            Xs = [10, 20, 30]
          }`,
      `Table2 = {
            Label2 = ["d", "e", "f"]
            Ys = [40, 50, 60]
          }`,
      `Matrix = Table1.Xs * Table2.Ys`
    ),
  });
  await timeout(0);

  const explanation = await computer.explainDimensions$.get(
    getDefined(computer.getBlockIdResult$.get('block-2'))
      .result as Result.Result<'materialized-column'>
  );

  expect(explanation).toMatchInlineSnapshot(`
    Array [
      Object {
        "dimensionLength": 3,
        "indexedBy": "Table1",
        "labels": Array [
          "a",
          "b",
          "c",
        ],
      },
      Object {
        "dimensionLength": 3,
        "indexedBy": "Table2",
        "labels": Array [
          "d",
          "e",
          "f",
        ],
      },
    ]
  `);
});
